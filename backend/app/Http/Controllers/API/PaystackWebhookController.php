<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Transaction;
use App\Services\MailDeliveryService;
use App\Services\NotificationService;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaystackWebhookController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
        protected MailDeliveryService $mailDeliveryService,
        protected PaystackService $paystackService
    ) {}

    /**
     * Handle incoming Paystack webhook events.
     * Verifies signature, validates with Paystack API, then processes.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('x-paystack-signature');

        if (! $signature) {
            Log::warning('Paystack webhook received without signature');

            return response()->json(['error' => 'Missing signature'], 400);
        }

        $webhookSecret = config('services.paystack.webhook_secret');
        if (! $webhookSecret) {
            Log::error('Paystack webhook secret not configured');

            return response()->json(['error' => 'Webhook not configured'], 500);
        }

        // Verify signature
        $calculatedHash = hash_hmac('sha512', $payload, $webhookSecret);
        if (! hash_equals($calculatedHash, $signature)) {
            Log::warning('Paystack webhook signature mismatch');

            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $data = json_decode($payload, true);
        if (! $data || ! isset($data['event'])) {
            return response()->json(['status' => 'ignored']);
        }

        $event = $data['event'];
        $reference = $data['data']['reference'] ?? null;

        Log::info('Paystack webhook received', [
            'event' => $event,
            'reference' => $reference,
        ]);

        // Only process successful charges
        if ($event !== 'charge.success' || ! $reference) {
            return response()->json(['status' => 'ignored']);
        }

        // Check if transaction already recorded (idempotency)
        $existing = Transaction::where('paystack_ref', $reference)->first();
        if ($existing && $existing->status === 'success') {
            Log::info('Paystack webhook: transaction already recorded', ['reference' => $reference]);

            return response()->json(['status' => 'already_processed']);
        }

        // Verify with Paystack API
        $verified = $this->verifyTransaction($reference);
        if (! $verified) {
            Log::error('Paystack webhook: API verification failed', ['reference' => $reference]);

            return response()->json(['error' => 'Verification failed'], 400);
        }

        $amount = $verified['amount'] / 100; // Convert from kobo/cents
        $currency = $verified['currency'];
        $customerEmail = $verified['customer']['email'] ?? $data['data']['customer']['email'] ?? '';
        $customerName = $verified['customer']['first_name'] ?? $data['data']['customer']['first_name'] ?? '';
        $serviceName = $verified['metadata']['service_name'] ?? 'Coaching Service';
        $serviceId = $verified['metadata']['service_id'] ?? null;

        // If transaction was pre-created by frontend, update it; otherwise create
        if ($existing) {
            $existing->update([
                'status' => 'success',
                'amount' => $amount,
                'currency' => $currency,
            ]);
            $transaction = $existing;
        } else {
            $transaction = Transaction::create([
                'name' => $customerName,
                'email' => $customerEmail,
                'amount' => $amount,
                'currency' => $currency,
                'service_id' => $serviceId,
                'paystack_ref' => $reference,
                'status' => 'success',
            ]);
        }

        $transaction->load('service');
        $serviceName = $transaction->service?->name ?? $serviceName;

        // Create appointment if not already created
        if (! $transaction->appointment) {
            $scheduledAt = now()->addDays(2)->setTime(10, 0);
            $durationMinutes = $this->parseDurationMinutes($transaction->service?->duration);

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
            "{$transaction->name} payment of {$transaction->currency} ".number_format($transaction->amount, 2)." for '{$serviceName}' confirmed via Paystack webhook.",
            [
                'transaction_id' => $transaction->id,
                'email' => $transaction->email,
                'paystack_ref' => $transaction->paystack_ref,
            ]
        );

        return response()->json(['status' => 'success']);
    }

    /**
     * Verify a transaction reference against the Paystack API.
     */
    private function verifyTransaction(string $reference): ?array
    {
        return $this->paystackService->verifyTransaction($reference);
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
            'transaction_id' => $transaction->paystack_ref,
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

    private function parseDurationMinutes(?string $duration): int
    {
        return $this->paystackService->parseDurationMinutes($duration);
    }
}
