<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'subject',
        'body',
        'variables',
        'description',
        'from_address',
        'from_name',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public static function findByKey(string $key): ?self
    {
        return static::query()->where('key', $key)->first();
    }

    /**
     * Get template by key, creating the default record if it does not exist.
     */
    public static function forKey(string $key): self
    {
        $template = static::findByKey($key);

        if ($template) {
            return $template;
        }

        $defaults = collect(self::defaultTemplates())->firstWhere('key', $key);

        return static::create($defaults ?? [
            'key' => $key,
            'name' => $key,
            'subject' => 'Notification',
            'body' => '<p>Hello {name},</p><p>You have a new notification.</p>',
            'variables' => ['{name}'],
        ]);
    }

    /**
     * Reset this template to its default content.
     */
    public function resetToDefault(): self
    {
        $default = collect(self::defaultTemplates())->firstWhere('key', $this->key);

        if ($default) {
            $this->update([
                'name' => $default['name'],
                'subject' => $default['subject'],
                'body' => $default['body'],
                'variables' => $default['variables'] ?? [],
                'description' => $default['description'] ?? null,
                'is_active' => true,
            ]);
        }

        return $this->refresh();
    }

    public static function defaultTemplates(): array
    {
        $infoEmail = env('MAIL_FROM_INFO', 'info@gm-coaching.com');
        $bookingsEmail = env('MAIL_FROM_BOOKINGS', 'bookings@gm-coaching.com');
        $securityEmail = env('MAIL_FROM_SECURITY', 'passwordreset@gm-coaching.com');

        return [
            [
                'key' => 'forgot_password',
                'name' => 'Forgot Password Verification Code',
                'subject' => 'Reset Your Password - Gathoni Mwai Coaching',
                'description' => 'Sent when a user requests a password reset.',
                'from_address' => $securityEmail,
                'from_name' => 'GM-Coaching Security',
                'variables' => ['{name}', '{code}'],
                'body' => <<<'HTML'
<h2>Password Reset Request</h2>
<p>Hello {name},</p>
<p>We received a request to reset your password. Use the verification code below to complete the password reset flow:</p>
<div class="otp-box">{code}</div>
<p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
HTML,
            ],
            [
                'key' => 'two_factor',
                'name' => '2FA Secure Login Code',
                'subject' => 'Your Two-Factor Authentication (2FA) Code',
                'description' => 'Sent to admins during two-factor authentication.',
                'from_address' => $securityEmail,
                'from_name' => 'GM-Coaching Security',
                'variables' => ['{name}', '{code}'],
                'body' => <<<'HTML'
<h2>Secure Verification Code</h2>
<p>Hello {name},</p>
<p>Your administration portal requires multi-factor authentication. Please use the following one-time security verification code to authorize your login:</p>
<div class="otp-box">{code}</div>
<p>This code will expire in 10 minutes. If you did not attempt to sign in, please update your account credentials immediately.</p>
HTML,
            ],
            [
                'key' => 'payment_success',
                'name' => 'Payment Received Success',
                'subject' => 'Payment Received Successfully - Gathoni Mwai Coaching',
                'description' => 'Sent immediately after a successful Stripe transaction.',
                'from_address' => $bookingsEmail,
                'from_name' => 'GM-Coaching Bookings',
                'variables' => ['{name}', '{amount}', '{service_name}', '{transaction_id}', '{date}', '{time}'],
                'body' => <<<'HTML'
<h2>Payment Successful!</h2>
<p>Hello {name},</p>
<p>Thank you for your payment! We have successfully processed your transaction for your booking.</p>
<div class="panel">
    <strong>Service:</strong> {service_name}<br>
    <strong>Amount Paid:</strong> {amount}<br>
    <strong>Transaction Reference:</strong> {transaction_id}
</div>
<p>A receipt has been generated and your booking is fully active. We look forward to our session.</p>
HTML,
            ],
            [
                'key' => 'booking_success',
                'name' => 'Coaching Booking Confirmation',
                'subject' => 'Coaching Session Confirmed: {service_name}',
                'description' => 'Sent immediately after a successful booking to confirm the session details.',
                'from_address' => $bookingsEmail,
                'from_name' => 'GM-Coaching Bookings',
                'variables' => ['{name}', '{service_name}', '{date}', '{time}', '{amount}', '{duration}'],
                'body' => <<<'HTML'
<h2>Coaching Booking Confirmed!</h2>
<p>Hello {name},</p>
<p>Congratulations! Your coaching session has been successfully booked and confirmed. Here are the details of your upcoming consultation:</p>
<div class="panel">
    <strong>Service:</strong> {service_name}<br>
    <strong>Date:</strong> {date}<br>
    <strong>Time:</strong> {time}<br>
    <strong>Duration:</strong> {duration}<br>
    <strong>Amount:</strong> {amount}
</div>
<p>We look forward to partnering with you on your journey. If you need to reschedule or have any questions, please feel free to reach out.</p>
HTML,
            ],
            [
                'key' => 'booking_reminder',
                'name' => 'Upcoming Session Reminder',
                'subject' => 'Reminder: Upcoming Coaching Session - {service_name}',
                'description' => 'Sent 24 hours before a scheduled coaching session.',
                'from_address' => $bookingsEmail,
                'from_name' => 'GM-Coaching Bookings',
                'variables' => ['{name}', '{service_name}', '{date}', '{time}', '{duration}'],
                'body' => <<<'HTML'
<h2>Reminder: Upcoming Coaching Session</h2>
<p>Hello {name},</p>
<p>This is a quick reminder that you have an upcoming coaching session scheduled with Gathoni Mwai. Here are the details:</p>
<div class="panel">
    <strong>Service:</strong> {service_name}<br>
    <strong>Date:</strong> {date}<br>
    <strong>Time:</strong> {time}<br>
    <strong>Duration:</strong> {duration}
</div>
<p>Please make sure you are prepared and ready at the scheduled time. See you soon!</p>
HTML,
            ],
            [
                'key' => 'meeting_followup',
                'name' => 'Session Follow-Up',
                'subject' => 'Thank You - Coaching Session Follow-Up',
                'description' => 'Sent after a coaching session has concluded.',
                'from_address' => $bookingsEmail,
                'from_name' => 'GM-Coaching Bookings',
                'variables' => ['{name}', '{service_name}', '{date}', '{time}'],
                'body' => <<<'HTML'
<h2>Thank You for Your Session</h2>
<p>Hello {name},</p>
<p>Thank you for joining the <strong>{service_name}</strong> coaching session on <strong>{date}</strong> at <strong>{time}</strong>. I hope the conversation brought clarity and actionable next steps for your journey.</p>
<div class="panel">
    If you have any follow-up questions or would like to book another session, simply reply to this email or visit the website.
</div>
<p>Rooting for your continued success,</p>
<p><strong>Gathoni Mwai</strong></p>
HTML,
            ],
            [
                'key' => 'welcome',
                'name' => 'Welcome Email',
                'subject' => 'Welcome to Gathoni Mwai Coaching',
                'description' => 'Sent when a new user registers an account.',
                'from_address' => $infoEmail,
                'from_name' => 'GM-Coaching',
                'variables' => ['{name}'],
                'body' => <<<'HTML'
<h2>Welcome, {name}!</h2>
<p>Thank you for joining Gathoni Mwai Coaching. You are now part of a community of ambitious African professionals reaching for global MBA and consulting opportunities.</p>
<p>Explore our services, book a session, or reach out with any questions.</p>
HTML,
            ],
            [
                'key' => 'inquiry_received',
                'name' => 'New Inquiry Notification (Admin)',
                'subject' => 'New Website Inquiry: {subject}',
                'description' => 'Sent to the admin when a contact form is submitted.',
                'from_address' => $infoEmail,
                'from_name' => 'GM-Coaching',
                'variables' => ['{name}', '{email}', '{subject}', '{country}', '{message}'],
                'body' => <<<'HTML'
<h2>New Client Inquiry</h2>
<p>A new client has reached out via the website contact form.</p>
<div class="panel">
    <strong>Name:</strong> {name}<br>
    <strong>Email:</strong> {email}<br>
    <strong>Subject:</strong> {subject}<br>
    <strong>Country:</strong> {country}
</div>
<p><strong>Message:</strong></p>
<div class="panel">{message}</div>
<p><a href="{admin_url}" class="button">Log into Admin Dashboard</a></p>
HTML,
            ],
            [
                'key' => 'inquiry_auto_reply',
                'name' => 'Inquiry Auto-Reply (Client)',
                'subject' => 'We received your message - Gathoni Mwai Coaching',
                'description' => 'Automatic confirmation sent to a client after submitting the contact form.',
                'from_address' => $infoEmail,
                'from_name' => 'GM-Coaching',
                'variables' => ['{name}', '{subject}'],
                'body' => <<<'HTML'
<h2>Thank You for Reaching Out</h2>
<p>Hello {name},</p>
<p>We have received your message regarding <strong>{subject}</strong> and will get back to you as soon as possible.</p>
<div class="panel">
    In the meantime, feel free to explore our latest insights on the blog or book a coaching session directly through the website.
</div>
<p>Warm regards,</p>
<p><strong>Gathoni Mwai Coaching Team</strong></p>
HTML,
            ],
        ];
    }
}
