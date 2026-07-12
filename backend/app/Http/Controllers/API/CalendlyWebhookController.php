<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use App\Services\NotificationService;
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
        $invitee = $data['invitee'] ?? [];
        $event = $data['event'] ?? [];

        $name = $invitee['name'] ?? 'Unknown';
        $email = $invitee['email'] ?? '';
        $startTime = $event['start_time'] ?? null;
        $endTime = $event['end_time'] ?? null;

        if (! $email || ! $startTime) {
            Log::warning('Calendly webhook missing required data', ['payload' => $data]);
            return;
        }

        // Check for duplicate (idempotency)
        $existing = Appointment::where('client_email', $email)
            ->where('scheduled_at', $startTime)
            ->first();

        if ($existing) {
            Log::info('Calendly: appointment already exists', ['email' => $email]);
            return;
        }

        // Find the coaching service or default
        $service = Service::where('name', 'like', '%Coaching%')->first()
            ?? Service::first();

        $scheduledAt = \Carbon\Carbon::parse($startTime);
        $durationMinutes = $startTime && $endTime
            ? (int) \Carbon\Carbon::parse($startTime)->diffInMinutes(\Carbon\Carbon::parse($endTime))
            : 60;

        Appointment::create([
            'service_id' => $service?->id,
            'client_name' => $name,
            'client_email' => $email,
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => $durationMinutes,
            'status' => 'scheduled',
            'notes' => 'Booked via Calendly',
        ]);

        $this->notificationService->notifyAdmins(
            'booking',
            'New Calendly Booking',
            "{$name} booked a session via Calendly for {$scheduledAt->format('F d, Y g:i A')}.",
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
        $invitee = $data['invitee'] ?? [];
        $email = $invitee['email'] ?? '';

        if (! $email) {
            return;
        }

        $appointment = Appointment::where('client_email', $email)
            ->where('status', 'scheduled')
            ->latest()
            ->first();

        if ($appointment) {
            $appointment->update(['status' => 'cancelled']);
            Log::info('Calendly: appointment cancelled', ['email' => $email]);
        }
    }
}
