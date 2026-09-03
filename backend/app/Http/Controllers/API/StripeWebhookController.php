<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Transaction;
use App\Services\MailDeliveryService;
use App\Services\NotificationService;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
        protected MailDeliveryService $mailDeliveryService,
        protected StripeService $stripeService
    ) {}

    /**
     * Handle incoming Stripe webhook events.
     * Verifies signature, then processes checkout.session.completed events.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('stripe-signature');

        if (! $sigHeader) {
            Log::warning('Stripe webhook received without signature');

            return response()->json(['error' => 'Missing signature'], 400);
        }

        $event = $this->stripeService->verifyWebhookSignature($payload, $sigHeader);
        if (! $event) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $eventType = $event['type'] ?? '';
        $eventData = $event['data']['object'] ?? null;

        Log::info('Stripe webhook received', [
            'event' => $eventType,
            'session_id' => $eventData['id'] ?? null,
        ]);

        // Only process completed checkouts
        if ($eventType !== 'checkout.session.completed' || ! $eventData) {
            return response()->json(['status' => 'ignored']);
        }

        $sessionId = $eventData['id'];
        $paymentIntentId = $eventData['payment_intent'] ?? null;
        $metadata = is_array($eventData['metadata'] ?? null) ? $eventData['metadata'] : (array) ($eventData['metadata'] ?? []);
        $customerEmail = $eventData['customer_email'] ?? $metadata['customer_email'] ?? '';
        $customerName = $metadata['customer_name'] ?? '';
        $amountTotal = ($eventData['amount_total'] ?? 0) / 100; // Convert from pence/cents
        $currency = strtoupper($eventData['currency'] ?? 'gbp');
        $serviceId = $metadata['service_id'] ?? null;

        // Idempotency: if this session was already processed, skip
        $existing = Transaction::where('stripe_checkout_session_id', $sessionId)->first();
        if ($existing && $existing->status === 'success') {
            Log::info('Stripe webhook: transaction already recorded', ['session_id' => $sessionId]);

            return response()->json(['status' => 'already_processed']);
        }

        // If transaction was pre-created by the frontend polling, update it; otherwise create
        if ($existing) {
            $existing->update([
                'status' => 'success',
                'amount' => $amountTotal,
                'currency' => $currency,
                'stripe_payment_intent_id' => $paymentIntentId,
            ]);
            $transaction = $existing;
        } else {
            $transaction = Transaction::create([
                'name' => $customerName,
                'email' => $customerEmail,
                'amount' => $amountTotal,
                'currency' => $currency,
                'service_id' => $serviceId,
                'stripe_payment_intent_id' => $paymentIntentId,
                'stripe_checkout_session_id' => $sessionId,
                'status' => 'success',
            ]);
        }

        $transaction->load('service');
        $serviceName = $transaction->service?->name ?? 'Coaching Service';

        // Create appointment if not already created
        if (! $transaction->appointment) {
            $scheduledAt = now()->addDays(2)->setTime(10, 0);
            $durationMinutes = $this->stripeService->parseDurationMinutes($transaction->service?->duration);

            Appointment::create([
                'transaction_id' => $transaction->id,
                'service_id' => $transaction->service_id,
                'client_name' => $transaction->name,
                'client_email' => $transaction->email,
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => $durationMinutes,
                'status' => 'scheduled',
            ]);
        }

        // Send emails if not already sent
        if (! $transaction->email_sent_at) {
            $this->sendBookingEmails($transaction, $serviceName);
            $transaction->update(['email_sent_at' => now()]);
        }

        $this->notificationService->notifyAdmins(
            'payment',
            'Payment Verified via Webhook',
            "{$transaction->name} payment of {$transaction->currency} ".number_format($transaction->amount, 2)." for '{$serviceName}' confirmed via Stripe webhook.",
            [
                'transaction_id' => $transaction->id,
                'email' => $transaction->email,
                'stripe_session_id' => $sessionId,
            ]
        );

        return response()->json(['status' => 'success']);
    }

    /**
     * Send booking and payment confirmation emails.
     */
    private function sendBookingEmails(Transaction $transaction, string $serviceName): void
    {
        $appointment = $transaction->appointment;
        $scheduledAt = $appointment?->scheduled_at ?? now()->addDays(2)->setTime(10, 0);
        $durationMinutes = $appointment?->duration_minutes ?? 60;

        $this->mailDeliveryService->send($transaction->email, 'payment_success', [
            'name' => $transaction->name,
            'service_name' => $serviceName,
            'amount' => $transaction->currency.' '.number_format($transaction->amount, 2),
            'transaction_id' => $transaction->stripe_payment_intent_id ?? $transaction->stripe_checkout_session_id ?? '',
            'date' => $scheduledAt->format('F d, Y'),
            'time' => $scheduledAt->format('g:i A (T)'),
        ]);

        $this->mailDeliveryService->send($transaction->email, 'booking_success', [
            'name' => $transaction->name,
            'service_name' => $serviceName,
            'date' => $scheduledAt->format('F d, Y'),
            'time' => $scheduledAt->format('g:i A (T)'),
            'duration' => $durationMinutes.' minutes',
            'amount' => $transaction->currency.' '.number_format($transaction->amount, 2),
        ]);
    }
}
