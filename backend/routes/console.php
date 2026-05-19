<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('bookings:send-reminders', function () {
    $this->info('Sending upcoming booking reminders...');
    
    // Select transactions created recently to simulate upcoming bookings
    $transactions = \App\Models\Transaction::where('created_at', '>=', now()->subDays(2))->get();
    
    $count = 0;
    foreach ($transactions as $tx) {
        try {
            \Illuminate\Support\Facades\Mail::to($tx->email)->send(
                new \App\Mail\DynamicSystemMail('booking_reminder', [
                    'name' => $tx->name,
                    'service_name' => $tx->service_name,
                    'date' => now()->addDay()->format('F d, Y'),
                    'time' => '10:00 AM (EAT)'
                ])
            );
            $count++;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send booking reminder to {$tx->email}: " . $e->getMessage());
        }
    }
    
    $this->info("Successfully sent {$count} booking reminders!");
})->purpose('Dispatch dynamic upcoming booking reminder emails to clients');
