<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

/**
 * Clients reserve a Calendly slot before paying. Reservations still unpaid
 * after the hold window are cancelled on Calendly so the slot opens up again.
 */
class UnpaidBookingReleaser
{
    public const CANCEL_REASON = 'Payment was not completed within the booking hold window, so this time slot has been released. You are welcome to book again at any time.';

    public function __construct(
        protected CalendlyService $calendly,
        protected StripeService $stripe,
        protected NotificationService $notifications,
    ) {}

    /**
     * Returns counts: [checked, released, paid, skipped].
     */
    public function releaseExpired(int $limit = 50): array
    {
        $result = ['checked' => 0, 'released' => 0, 'paid' => 0, 'skipped' => 0];

        $holdMinutes = (int) config('services.calendly.unpaid_hold_minutes', 120);
        $expired = Transaction::query()
            ->where('status', 'pending')
            ->whereNotNull('calendly_invitee_uri')
            ->where('created_at', '<=', now()->subMinutes($holdMinutes))
            ->limit($limit)
            ->get();

        foreach ($expired as $transaction) {
            $result['checked']++;
            $outcome = $this->process($transaction);
            $result[$outcome]++;
        }

        return $result;
    }

    /**
     * @return 'released'|'paid'|'skipped'
     */
    private function process(Transaction $transaction): string
    {
        // Payment may have gone through without the webhook landing, or still be in progress.
        if ($transaction->stripe_checkout_session_id && $this->stripe->isConfigured()) {
            if ($this->stripe->reconcilePendingTransaction($transaction)) {
                Appointment::attachToTransaction($transaction);

                return 'paid';
            }

            $session = $this->stripe->getCheckoutSession($transaction->stripe_checkout_session_id);
            if (! $session || $session->status === 'open') {
                return 'skipped';
            }
        }

        $invitee = $this->calendly->getInvitee($transaction->calendly_invitee_uri);
        if (! $invitee) {
            Log::warning('Release unpaid booking: could not load Calendly invitee', ['transaction_id' => $transaction->id]);

            return 'skipped';
        }

        // Guard against releasing someone else's booking through a mismatched URI.
        if (strcasecmp($invitee['email'] ?? '', $transaction->email) !== 0) {
            Log::warning('Release unpaid booking: invitee email does not match transaction', ['transaction_id' => $transaction->id]);

            return 'skipped';
        }

        if (($invitee['status'] ?? null) !== 'canceled'
            && ! $this->calendly->cancelEventForInvitee($transaction->calendly_invitee_uri, self::CANCEL_REASON)) {
            return 'skipped';
        }

        $transaction->update(['status' => 'cancelled']);
        Appointment::where('calendly_invitee_uri', $transaction->calendly_invitee_uri)
            ->where('status', 'scheduled')
            ->update(['status' => 'cancelled']);

        $this->notifications->notifyAdmins(
            'booking',
            'Unpaid Booking Released',
            "{$transaction->name}'s reserved slot was cancelled on Calendly because payment wasn't completed in time.",
            [
                'transaction_id' => $transaction->id,
                'email' => $transaction->email,
            ]
        );

        Log::info('Released unpaid Calendly booking', ['transaction_id' => $transaction->id]);

        return 'released';
    }
}
