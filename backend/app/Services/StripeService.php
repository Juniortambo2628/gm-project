<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as CheckoutSession;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeService
{
    private bool $configured;

    public function __construct()
    {
        $secret = config('services.stripe.secret');
        $this->configured = ! empty($secret);
        if ($this->configured) {
            Stripe::setApiKey($secret);
        }
    }

    public function isConfigured(): bool
    {
        return $this->configured;
    }

    /**
     * Create a Stripe Checkout Session for a service purchase.
     */
    public function createCheckoutSession(
        string $serviceName,
        int $amountInPence,
        string $currency,
        string $customerEmail,
        string $customerName,
        array $metadata = [],
    ): ?CheckoutSession {
        try {
            $session = CheckoutSession::create([
                'payment_method_types' => ['card'],
                'customer_email' => $customerEmail,
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => strtolower($currency),
                            'unit_amount' => $amountInPence,
                            'product_data' => [
                                'name' => $serviceName,
                            ],
                        ],
                        'quantity' => 1,
                    ],
                ],
                'mode' => 'payment',
                'success_url' => $this->getSuccessUrl(),
                'cancel_url' => $this->getCancelUrl(),
                'metadata' => array_merge($metadata, [
                    'customer_name' => $customerName,
                    'customer_email' => $customerEmail,
                ]),
            ]);

            return $session;
        } catch (ApiErrorException $e) {
            Log::error('Stripe checkout session creation failed: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Retrieve a Checkout Session by ID.
     */
    public function getCheckoutSession(string $sessionId): ?CheckoutSession
    {
        try {
            return CheckoutSession::retrieve($sessionId);
        } catch (ApiErrorException $e) {
            Log::error('Stripe checkout session retrieval failed: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Verify a webhook signature and return the parsed event.
     */
    public function verifyWebhookSignature(string $payload, string $sigHeader): ?array
    {
        $webhookSecret = config('services.stripe.webhook_secret');
        if (! $webhookSecret) {
            Log::error('Stripe webhook secret not configured');

            return null;
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);

            return json_decode(json_encode($event), true);
        } catch (\Exception $e) {
            Log::warning('Stripe webhook signature verification failed: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Parse a duration string (e.g. "60 minutes", "1h 30m") into minutes.
     */
    public function parseDurationMinutes(?string $duration): int
    {
        if (! $duration) {
            return 60;
        }

        if (preg_match('/(\d+)/', $duration, $matches)) {
            return max(15, (int) $matches[1]);
        }

        return 60;
    }

    /**
     * Check Stripe for a single pending Transaction and, if the underlying
     * checkout session has been paid, promote it to success in the database.
     *
     * Returns true when the record was reconciled, false otherwise.
     */
    public function reconcilePendingTransaction(Transaction $tx): bool
    {
        if (! $this->configured || empty($tx->stripe_checkout_session_id)) {
            return false;
        }

        $session = $this->getCheckoutSession($tx->stripe_checkout_session_id);
        if (! $session || $session->payment_status !== 'paid') {
            return false;
        }

        $amountTotal = ($session->amount_total ?? 0) / 100;
        $tx->update([
            'status' => 'success',
            'amount' => $amountTotal > 0 ? $amountTotal : $tx->amount,
            'currency' => strtoupper($session->currency ?? $tx->currency),
            'stripe_payment_intent_id' => $session->payment_intent ?? $tx->stripe_payment_intent_id,
        ]);

        return true;
    }

    /**
     * Reconcile every pending transaction from the last $days days.
     *
     * Returns [checked, reconciled] counts.
     */
    public function reconcilePendingTransactions(int $days = 30, int $limit = 100): array
    {
        $pending = Transaction::query()
            ->where('status', 'pending')
            ->whereNotNull('stripe_checkout_session_id')
            ->where('created_at', '>=', now()->subDays($days))
            ->limit($limit)
            ->get();

        $reconciled = 0;
        foreach ($pending as $tx) {
            if ($this->reconcilePendingTransaction($tx)) {
                $reconciled++;
            }
        }

        return ['checked' => $pending->count(), 'reconciled' => $reconciled];
    }

    private function getSuccessUrl(): string
    {
        return config('services.stripe.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')).'/book/?session_id={CHECKOUT_SESSION_ID}';
    }

    private function getCancelUrl(): string
    {
        return config('services.stripe.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')).'/book/';
    }
}
