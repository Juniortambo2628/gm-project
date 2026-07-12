<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\MailTemplate;
use App\Models\Setting;

class DynamicSystemMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $htmlContent;
    public string $mailSubject;
    private ?string $fromAddress;
    private ?string $fromName;

    public function __construct(string $templateKey, array $placeholders = [])
    {
        $template = MailTemplate::forKey($templateKey);

        $subject = $template->subject;
        $content = $template->body;

        // Per-template from address (overrides global MAIL_FROM_ADDRESS)
        $this->fromAddress = $template->from_address;
        $this->fromName = $template->from_name;

        // Merge provided placeholders with global placeholders
        $placeholders = array_merge($this->globalPlaceholders(), $placeholders);

        foreach ($placeholders as $key => $value) {
            $subject = str_replace('{' . $key . '}', (string) $value, $subject);
            $content = str_replace('{' . $key . '}', (string) $value, $content);
        }

        $this->mailSubject = $subject;
        $this->htmlContent = $this->wrapInPremiumLayout($subject, $content);
    }

    public function envelope(): Envelope
    {
        $envelope = new Envelope(
            subject: $this->mailSubject,
        );

        // Apply per-template from address if set
        if ($this->fromAddress) {
            $envelope->from = new \Illuminate\Mail\Mailables\Address(
                $this->fromAddress,
                $this->fromName ?? config('mail.from.name', config('app.name'))
            );
        }

        return $envelope;
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->htmlContent,
        );
    }

    /**
     * Global placeholders available in every template.
     */
    private function globalPlaceholders(): array
    {
        return [
            'logo_url' => $this->logoUrl(),
            'app_name' => config('app.name', 'Gathoni Mwai Coaching'),
            'frontend_url' => rtrim(config('app.frontend_url', config('app.url', 'https://example.com')), '/'),
            'current_year' => (string) now()->year,
        ];
    }

    private function logoUrl(): string
    {
        $logo = Setting::get('logo_dark', '/branding/GM-logo-dark-final.png');

        if (filter_var($logo, FILTER_VALIDATE_URL)) {
            return $logo;
        }

        return rtrim(config('app.url', 'https://example.com'), '/') . $logo;
    }

    private function wrapInPremiumLayout(string $subject, string $content): string
    {
        $logo = $this->logoUrl();
        $appName = config('app.name', 'Gathoni Mwai Coaching');
        $frontendUrl = rtrim(config('app.frontend_url', config('app.url', 'https://example.com')), '/');
        $year = now()->year;

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$this->e($subject)}</title>
    <style>
        body {
            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
        a { color: #dc2626; }
        ul, ol { padding-left: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="{$this->e($frontendUrl)}" target="_blank">
                <img src="{$this->e($logo)}" alt="{$this->e($appName)}" class="logo">
            </a>
        </div>
        <div class="body">
            {$content}
        </div>
        <div class="footer">
            <p>&copy; {$year} {$this->e($appName)}. All rights reserved.</p>
            <p>You received this email because you are registered on {$this->e($appName)}.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }

    private function e(string $text): string
    {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}
