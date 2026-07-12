<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schedule;
use App\Models\Appointment;
use App\Mail\DynamicSystemMail;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('appointments:send-reminders', function () {
    $this->info('Sending upcoming appointment reminders...');

    $appointments = Appointment::query()
        ->where('status', 'scheduled')
        ->whereNull('reminder_sent_at')
        ->where('scheduled_at', '>', now())
        ->where('scheduled_at', '<=', now()->addHours(24))
        ->with('service')
        ->get();

    $count = 0;
    foreach ($appointments as $appointment) {
        try {
            Mail::to($appointment->client_email)->queue(
                new DynamicSystemMail('booking_reminder', [
                    'name' => $appointment->client_name,
                    'service_name' => $appointment->service?->name ?? 'Coaching Session',
                    'date' => $appointment->scheduled_at->format('F d, Y'),
                    'time' => $appointment->scheduled_at->format('g:i A (T)'),
                    'duration' => $appointment->duration_minutes . ' minutes',
                ])
            );
            $appointment->markReminderSent();
            $count++;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send reminder to {$appointment->client_email}: " . $e->getMessage());
        }
    }

    $this->info("Successfully sent {$count} appointment reminders.");
})->purpose('Dispatch dynamic upcoming appointment reminder emails to clients');

Artisan::command('appointments:send-followups', function () {
    $this->info('Sending concluded appointment follow-ups...');

    $appointments = Appointment::query()
        ->where('status', 'scheduled')
        ->whereNull('followup_sent_at')
        ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) <= ?', [now()])
        ->with('service')
        ->get();

    $count = 0;
    foreach ($appointments as $appointment) {
        try {
            Mail::to($appointment->client_email)->queue(
                new DynamicSystemMail('meeting_followup', [
                    'name' => $appointment->client_name,
                    'service_name' => $appointment->service?->name ?? 'Coaching Session',
                    'date' => $appointment->scheduled_at->format('F d, Y'),
                    'time' => $appointment->scheduled_at->format('g:i A (T)'),
                ])
            );
            $appointment->markFollowupSent();
            $count++;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send follow-up to {$appointment->client_email}: " . $e->getMessage());
        }
    }

    $this->info("Successfully sent {$count} appointment follow-ups.");
})->purpose('Dispatch dynamic post-session follow-up emails to clients');

// Keep legacy alias for backward compatibility
Artisan::command('bookings:send-reminders', function () {
    $this->call('appointments:send-reminders');
})->purpose('Alias for appointments:send-reminders');

Schedule::command('appointments:send-reminders')->hourly();
Schedule::command('appointments:send-followups')->hourly();
