<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\Transaction;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CalendlyWebhookController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Handle Calendly webhook events (invitee.created, invitee.canceled).
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $event = $payload['event'] ?? null;

        if (! $event) {
            return response()->json(['status' => 'ignored']);
        }

        // Verify webhook signature if signing key is configured
        $signingKey = config('services.calendly.signing_key');
        if ($signingKey) {
            $signature = $request->header('calendly-webhook-signature');
            if (! $this->verifySignature($request->getContent(), $signature, $signingKey)) {
                Log::warning('Calendly webhook signature verification failed');

                return response()->json(['status' => 'invalid_signature'], 401);
            }
        } else {
            Log::info('Calendly webhook signature verification skipped (no signing key configured)');
        }

        Log::info('Calendly webhook received', ['event' => $event]);

        match ($event) {
            'invitee.created' => $this->handleInviteeCreated($payload),
            'invitee.canceled' => $this->handleInviteeCanceled($payload),
            default => null,
        };

        return response()->json(['status' => 'ok']);
    }

    private function handleInviteeCreated(array $payload): void
    {
        $data = $payload['payload'] ?? [];
        // Support both the legacy (invitee/event) and v2 (flat invitee + scheduled_event) shapes.
        $invitee = $data['invitee'] ?? $data;
        $event = $data['event'] ?? $data['scheduled_event'] ?? [];

        $name = $invitee['name'] ?? 'Unknown';
        $email = $invitee['email'] ?? '';
        $inviteeUri = $invitee['uri'] ?? null;
        $startTime = $event['start_time'] ?? null;
        $endTime = $event['end_time'] ?? null;

        if (! $email || ! $startTime) {
            Log::warning('Calendly webhook missing required data', ['payload' => $data]);

            return;
        }

        $scheduledAt = Carbon::parse($startTime);
        $durationMinutes = $endTime
            ? (int) $scheduledAt->diffInMinutes(Carbon::parse($endTime))
            : 60;

        // A paid booking whose Stripe webhook arrived first holds a placeholder
        // appointment keyed by the invitee URI: fill in the real slot.
        if ($inviteeUri && $existing = Appointment::where('calendly_invitee_uri', $inviteeUri)->first()) {
            $existing->update([
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => $durationMinutes,
                'status' => 'scheduled',
            ]);
            Log::info('Calendly: appointment updated with booked slot', ['email' => $email]);

            return;
        }

        // Check for duplicate (idempotency)
        $existing = Appointment::where('client_email', $email)
            ->where('scheduled_at', $scheduledAt)
            ->first();

        if ($existing) {
            Log::info('Calendly: appointment already exists', ['email' => $email]);

            return;
        }

        // Slots are booked before payment, so a matching transaction may already exist.
        $transaction = $inviteeUri
            ? Transaction::where('calendly_invitee_uri', $inviteeUri)->first()
            : null;

        $service = $transaction?->service
            ?? Service::where('name', 'like', '%Coaching%')->first()
            ?? Service::first();

        Appointment::create([
            'transaction_id' => $transaction?->id,
            'calendly_invitee_uri' => $inviteeUri,
            'service_id' => $service?->id,
            'client_name' => $name,
            'client_email' => $email,
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => $durationMinutes,
            'status' => 'scheduled',
            'notes' => 'Booked via Calendly',
        ]);

        $paid = $transaction?->status === 'success';
        $this->notificationService->notifyAdmins(
            'booking',
            'New Calendly Booking',
            "{$name} booked a session via Calendly for {$scheduledAt->format('F d, Y g:i A')}.".($paid ? '' : ' Payment pending.'),
            [
                'email' => $email,
                'scheduled_at' => $startTime,
            ]
        );

        Log::info('Calendly: appointment created', [
            'email' => $email,
            'scheduled_at' => $startTime,
        ]);
    }

    private function handleInviteeCanceled(array $payload): void
    {
        $data = $payload['payload'] ?? [];
        $invitee = $data['invitee'] ?? $data;
        $email = $invitee['email'] ?? '';
        $inviteeUri = $invitee['uri'] ?? null;

        $appointment = $inviteeUri
            ? Appointment::where('calendly_invitee_uri', $inviteeUri)->where('status', 'scheduled')->first()
            : null;

        if (! $appointment && $email) {
            $appointment = Appointment::where('client_email', $email)
                ->where('status', 'scheduled')
                ->latest()
                ->first();
        }

        if ($appointment) {
            $appointment->update(['status' => 'cancelled']);
            Log::info('Calendly: appointment cancelled', ['email' => $email]);
        }
    }

    /**
     * Verify the Calendly webhook signature.
     *
     * @see https://developer.calendly.com/api-docs/d515db4c053f8-webhook-signature-verification
     */
    private function verifySignature(string $body, ?string $signatureHeader, string $signingKey): bool
    {
        if (! $signatureHeader) {
            return false;
        }

        // Parse the signature header: t=<timestamp>,v1=<signature>
        $parts = [];
        foreach (explode(',', $signatureHeader) as $pair) {
            [$key, $value] = explode('=', $pair, 2);
            $parts[trim($key)] = trim($value);
        }

        $timestamp = $parts['t'] ?? null;
        $v1Signature = $parts['v1'] ?? null;

        if (! $timestamp || ! $v1Signature) {
            return false;
        }

        // Reject requests older than 3 minutes to prevent replay attacks
        if (abs(time() - (int) $timestamp) > 180) {
            return false;
        }

        $signedContent = "{$timestamp}.{$body}";
        $expectedSignature = hash_hmac('sha256', $signedContent, $signingKey);

        return hash_equals($expectedSignature, $v1Signature);
    }
}
