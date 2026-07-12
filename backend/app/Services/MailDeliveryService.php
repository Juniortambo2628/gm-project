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
        $status = $queue ? 'queued' : 'sent';

        $log = MailLog::create([
            'recipient' => $to,
            'template_key' => $templateKey,
            'subject' => $subject,
            'status' => $status,
            'provider' => config('mail.default'),
            'from_address' => $fromAddress,
            'sent_at' => now(),
        ]);

        try {
            if ($queue) {
                Mail::to($to)->queue($mailable);
            } else {
                Mail::to($to)->send($mailable);
                $log->update(['status' => 'sent']);
            }

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to dispatch email [{$templateKey}] to {$to}: " . $e->getMessage());

            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send a test email synchronously for the tester UI.
     */
    public function sendTest(string $to, string $templateKey, array $placeholders = []): array
    {
        $success = $this->send($to, $templateKey, $placeholders, false);
        $mailable = new DynamicSystemMail($templateKey, $placeholders);

        return [
            'success' => $success,
            'recipient' => $to,
            'template_key' => $templateKey,
            'subject' => $mailable->mailSubject,
        ];
    }
}
