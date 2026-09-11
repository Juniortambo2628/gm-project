<?php

namespace App\Services;

use App\Mail\DynamicSystemMail;
use App\Models\MailLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MailDeliveryService
{
    /**
     * Send a dynamic system email and record a log entry.
     */
    public function send(string $to, string $templateKey, array $placeholders = [], bool $queue = true): bool
    {
        $mailable = new DynamicSystemMail($templateKey, $placeholders);
        $subject = $mailable->mailSubject;
        $fromAddress = $mailable->fromAddress ?? config('mail.from.address');

        $log = MailLog::create([
            'recipient' => $to,
            'template_key' => $templateKey,
            'subject' => $subject,
            'status' => 'sending',
            'provider' => config('mail.default'),
            'from_address' => $fromAddress,
            'sent_at' => now(),
        ]);

        try {
            if ($queue) {
                Mail::to($to)->queue($mailable);
                $log->update(['status' => 'queued']);
            } else {
                Mail::to($to)->send($mailable);
                $log->update(['status' => 'sent']);
            }

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to dispatch email [{$templateKey}] to {$to}: ".$e->getMessage());

            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send a test email synchronously and return detailed result.
     */
    public function sendTest(string $to, string $templateKey, array $placeholders = []): array
    {
        $driver = config('mail.default');

        if ($driver === 'log' || $driver === 'array') {
            return [
                'success' => false,
                'recipient' => $to,
                'template_key' => $templateKey,
                'subject' => '',
                'error' => "Mail driver is set to \"{$driver}\". Emails are written to the log file, not delivered. Set MAIL_MAILER=smtp in your .env file.",
            ];
        }

        $success = $this->send($to, $templateKey, $placeholders, false);
        $mailable = new DynamicSystemMail($templateKey, $placeholders);

        return [
            'success' => $success,
            'recipient' => $to,
            'template_key' => $templateKey,
            'subject' => $mailable->mailSubject,
            'error' => $success ? null : "Mail::send() did not throw, but delivery may have failed. Check storage/logs/laravel.log and the mail_logs table.",
        ];
    }
}
