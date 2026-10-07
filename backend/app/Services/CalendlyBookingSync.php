<?php

namespace App\Services;

use App\Models\Appointment;
use Illuminate\Support\Facades\Log;

/**
 * Keeps upcoming paid appointments in step with Calendly when no webhook is
 * available (webhooks need a paid Calendly plan): fills in or corrects the
 * booked time, and marks appointments cancelled when the event was cancelled
 * or rescheduled in Calendly.
 */
class CalendlyBookingSync
{
    public function __construct(
        protected CalendlyService $calendly,
        protected NotificationService $notifications,
    ) {}

    /**
     * Returns counts: [checked, updated, cancelled].
     */
    public function syncUpcoming(int $limit = 100): array
    {
        $result = ['checked' => 0, 'updated' => 0, 'cancelled' => 0];

        $appointments = Appointment::query()
            ->where('status', 'scheduled')
            ->whereNotNull('calendly_invitee_uri')
            ->where('scheduled_at', '>=', now()->subDay())
            ->orderBy('scheduled_at')
            ->limit($limit)
            ->get();

        foreach ($appointments as $appointment) {
            $result['checked']++;
            $slot = $this->calendly->getBookedSlot($appointment->calendly_invitee_uri);
            if (! $slot) {
                continue;
            }

            if ($slot['status'] === 'canceled') {
                $appointment->update(['status' => 'cancelled']);
                $result['cancelled']++;

                $this->notifications->notifyAdmins(
                    'booking',
                    'Booking Cancelled in Calendly',
                    "{$appointment->client_name}'s session on {$appointment->scheduled_at->format('F d, Y g:i A')} was cancelled or rescheduled in Calendly. Check Calendly for any new time.",
                    ['appointment_id' => $appointment->id, 'email' => $appointment->client_email]
                );
                Log::info('Calendly sync: appointment cancelled', ['appointment_id' => $appointment->id]);

                continue;
            }

            $duration = (int) $slot['start']->diffInMinutes($slot['end']);
            if (! $appointment->scheduled_at->equalTo($slot['start']) || $appointment->duration_minutes !== $duration) {
                $appointment->update(['scheduled_at' => $slot['start'], 'duration_minutes' => $duration]);
                $result['updated']++;
                Log::info('Calendly sync: appointment time updated', ['appointment_id' => $appointment->id]);
            }
        }

        return $result;
    }
}
