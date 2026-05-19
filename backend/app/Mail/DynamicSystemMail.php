<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Setting;

class DynamicSystemMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $htmlContent;
    public string $mailSubject;

    public function __construct(string $templateKey, array $placeholders)
    {
        // 1. Fetch template from settings
        $subject = Setting::get('template_subject_' . $templateKey);
        $content = Setting::get('template_content_' . $templateKey);

        // Fallbacks if not set
        if (!$subject) {
            $subject = $this->getDefaultSubject($templateKey);
        }
        if (!$content) {
            $content = $this->getDefaultContent($templateKey);
        }

        // 2. Process placeholders
        foreach ($placeholders as $key => $val) {
            $subject = str_replace('{' . $key . '}', $val, $subject);
            $content = str_replace('{' . $key . '}', $val, $content);
        }

        // 3. Wrap in premium layout
        $this->mailSubject = $subject;
        $this->htmlContent = $this->wrapInPremiumLayout($subject, $content);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->mailSubject,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->htmlContent,
        );
    }

    private function wrapInPremiumLayout(string $subject, string $content): string
    {
        $logo = Setting::get('logo_dark', '/branding/GM-logo-dark-final.png');
        if (strpos($logo, 'http') === false) {
            $logo = rtrim(config('app.url', 'https://api-gm-consulting.okjtech.co.ke'), '/') . $logo;
        }

        return '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' . htmlspecialchars($subject) . '</title>
    <style>
        body {
            font-family: \'Outfit\', \'Inter\', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
            border: 1px solid #f1f5f9;
        }
        .header {
            background-color: #0f172a;
            padding: 40px;
            text-align: center;
        }
        .logo {
            height: 48px;
            width: auto;
        }
        .body {
            padding: 48px;
            color: #334155;
            font-size: 15px;
            line-height: 1.8;
        }
        .footer {
            background-color: #f8fafc;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            font-size: 12px;
            color: #64748b;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #dc2626;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 800;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 24px 0;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
        }
        .panel {
            background-color: #f8fafc;
            border-left: 4px solid #dc2626;
            padding: 20px;
            margin: 24px 0;
            border-radius: 0 12px 12px 0;
            font-style: italic;
        }
        h1, h2, h3 {
            color: #0f172a;
            margin-top: 0;
        }
        .otp-box {
            background: #f8fafc;
            border: 2px dashed #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            letter-spacing: 0.2em;
            color: #0f172a;
            margin: 32px 0;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="' . htmlspecialchars($logo) . '" alt="Gathoni Mwai Coaching" class="logo">
        </div>
        <div class="body">
            ' . $content . '
        </div>
        <div class="footer">
            <p>&copy; ' . date(\'Y\') . ' Gathoni Mwai Coaching. All rights reserved.</p>
            <p>You received this email because you are registered on Gathoni Mwai Coaching.</p>
        </div>
    </div>
</body>
</html>';
    }

    private function getDefaultSubject(string $templateKey): string
    {
        switch ($templateKey) {
            case 'forgot_password':
                return 'Reset Your Password - Gathoni Mwai Coaching';
            case 'two_factor':
                return 'Your Two-Factor Authentication (2FA) Code';
            case 'booking_success':
                return 'Coaching Session Confirmed: {service_name}';
            case 'booking_reminder':
                return 'Reminder: Upcoming Coaching Session - {service_name}';
            case 'payment_success':
                return 'Payment Received Successfully - Gathoni Mwai Coaching';
            default:
                return 'Notification - Gathoni Mwai Coaching';
        }
    }

    private function getDefaultContent(string $templateKey): string
    {
        switch ($templateKey) {
            case 'forgot_password':
                return '
<h2>Password Reset Request</h2>
<p>Hello {name},</p>
<p>We received a request to reset your password. Use the verification code below to complete the password reset flow:</p>
<div class="otp-box">{code}</div>
<p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>';

            case 'two_factor':
                return '
<h2>Secure Verification Code</h2>
<p>Hello {name},</p>
<p>Your administration portal requires multi-factor authentication. Please use the following one-time security verification code to authorize your login:</p>
<div class="otp-box">{code}</div>
<p>This code will expire in 10 minutes. If you did not attempt to sign in, please update your account credentials immediately.</p>';

            case 'booking_success':
                return '
<h2>Coaching Booking Confirmed!</h2>
<p>Hello {name},</p>
<p>Congratulations! Your coaching session has been successfully booked and confirmed. Here are the details of your upcoming consultation:</p>
<div class="panel">
    <strong>Service:</strong> {service_name}<br>
    <strong>Date:</strong> {date}<br>
    <strong>Time:</strong> {time}<br>
    <strong>Amount:</strong> {amount}
</div>
<p>We look forward to partnering with you on your journey. If you need to reschedule or have any questions, please feel free to reach out.</p>';

            case 'booking_reminder':
                return '
<h2>Reminder: Upcoming Coaching Session</h2>
<p>Hello {name},</p>
<p>This is a quick reminder that you have an upcoming coaching session scheduled with Gathoni Mwai. Here are the details:</p>
<div class="panel">
    <strong>Service:</strong> {service_name}<br>
    <strong>Date:</strong> {date}<br>
    <strong>Time:</strong> {time}
</div>
<p>Please make sure you are prepared and ready at the scheduled time. See you soon!</p>';

            case 'payment_success':
                return '
<h2>Payment Successful!</h2>
<p>Hello {name},</p>
<p>Thank you for your payment! We have successfully processed your transaction for your booking.</p>
<div class="panel">
    <strong>Service:</strong> {service_name}<br>
    <strong>Amount Paid:</strong> {amount}<br>
    <strong>Transaction Reference:</strong> {transaction_id}
</div>
<p>A receipt has been generated and your booking is fully active. We appreciate your partnership!</p>';

            default:
                return '<p>Hello {name}, you have a new notification from Gathoni Mwai Coaching.</p>';
        }
    }
}
