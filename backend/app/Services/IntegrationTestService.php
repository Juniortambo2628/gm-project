<?php

namespace App\Services;

use App\Models\IntegrationTestResult;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IntegrationTestService
{
    public function all(): array
    {
        return [
            $this->paystack(),
            $this->smtp(),
            $this->calendly(),
            $this->reverb(),
            $this->s3(),
            $this->backendApi(),
            $this->googleFonts(),
        ];
    }

    public function test(string $key): array
    {
        return match ($key) {
            'paystack' => $this->paystack(),
            'smtp' => $this->smtp(),
            'calendly' => $this->calendly(),
            'reverb' => $this->reverb(),
            's3' => $this->s3(),
            'backend_api' => $this->backendApi(),
            'google_fonts' => $this->googleFonts(),
            default => [
                'key' => $key,
                'status' => 'error',
                'configured' => false,
                'connected' => false,
                'message' => 'Unknown integration key.',
            ]
        };
    }

    private function paystack(): array
    {
        $secret = config('services.paystack.secret');
        $public = config('services.paystack.public');
        $configured = !empty($secret) && !empty($public);
        $message = 'Paystack is configured.';
        $status = 'ok';
        $connected = false;
        $details = [
            'has_public_key' => !empty($public),
            'has_secret_key' => !empty($secret),
            'key_prefix' => $public ? substr($public, 0, 8) . '...' : null,
        ];

        if (!$configured) {
            $message = 'Paystack keys are not set. Add PAYSTACK_PUBLIC_KEY and PAYSTACK_SECRET_KEY to your .env file.';
            $status = 'warning';
        } else {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $secret,
                    'Content-Type' => 'application/json',
                ])->timeout(10)->get('https://api.paystack.co/transaction?perPage=1');

                if ($response->successful()) {
                    $connected = true;
                    $message = 'Paystack API connection successful. Keys are valid.';
                    $status = 'ok';
                    $details['api_response'] = $response->json('message', 'OK');
                } else {
                    $status = 'error';
                    $message = 'Paystack API returned an error. Status: ' . $response->status();
                    $details['status_code'] = $response->status();
                }
            } catch (\Exception $e) {
                $status = 'error';
                $message = 'Could not connect to Paystack API: ' . $e->getMessage();
                $details['error'] = $e->getMessage();
            }
        }

        return $this->persist('paystack', 'Paystack', $status, $configured, $connected, $message, $details);
    }

    private function smtp(): array
    {
        $driver = config('mail.default');
        $host = config("mail.mailers.{$driver}.host");
        $port = config("mail.mailers.{$driver}.port");
        $username = config("mail.mailers.{$driver}.username");
        $hasPassword = !empty(config("mail.mailers.{$driver}.password") ?? env('MAIL_PASSWORD'));
        $from = config('mail.from.address');
        $configured = !empty($host) || in_array($driver, ['log', 'array']);
        $message = '';
        $status = 'ok';
        $connected = false;
        $details = [
            'driver' => $driver,
            'host' => $host,
            'port' => $port,
            'username' => $username,
            'has_password' => $hasPassword,
            'from_address' => $from,
        ];

        if ($driver === 'log' || $driver === 'array') {
            $configured = true;
            $connected = true;
            $message = "Mail driver is set to \"{$driver}\". Emails are not delivered to real recipients.";
            $status = 'warning';
        } elseif (empty($host)) {
            $message = 'SMTP host is missing. Set MAIL_HOST in your .env file.';
            $status = 'error';
        } elseif (!$hasPassword) {
            $message = 'SMTP password is not set. Add MAIL_PASSWORD to your .env file.';
            $status = 'error';
        } else {
            try {
                $fp = @fsockopen($host, $port ?: 587, $errno, $errstr, 5);
                if ($fp) {
                    fclose($fp);
                    $connected = true;
                    $message = "SMTP server {$host}:{$port} is reachable. Connection successful.";
                    $status = 'ok';
                } else {
                    $message = "Could not connect to SMTP server {$host}:{$port}. Error: {$errstr}";
                    $status = 'error';
                }
            } catch (\Exception $e) {
                $message = "SMTP connection test failed: " . $e->getMessage();
                $status = 'error';
            }
        }

        return $this->persist('smtp', 'SMTP / Email', $status, $configured, $connected, $message, $details);
    }

    private function calendly(): array
    {
        $urls = [
            'discovery' => Setting::get('discovery_calendly_url'),
            'mba' => Setting::get('mba_calendly_url'),
            'consulting' => Setting::get('consulting_calendly_url'),
        ];

        $configuredCount = count(array_filter($urls));
        $configured = $configuredCount > 0;
        $message = '';
        $status = 'ok';
        $connected = false;
        $details = [
            'discovery_url' => $urls['discovery'] ?: null,
            'mba_url' => $urls['mba'] ?: null,
            'consulting_url' => $urls['consulting'] ?: null,
            'configured_count' => $configuredCount,
            'total_expected' => 3,
        ];

        if (!$configured) {
            $message = 'No Calendly URLs configured. Set them in the CMS settings.';
            $status = 'warning';
        } else {
            try {
                $testUrl = $urls['discovery'] ?? reset(array_filter($urls));
                $response = Http::timeout(10)->get($testUrl);

                if ($response->successful()) {
                    $connected = true;
                    $message = "Calendly widget is accessible. {$configuredCount} of 3 URLs configured.";
                    if ($configuredCount < 3) {
                        $status = 'warning';
                        $message .= ' Consider configuring all three URLs.';
                    }
                } else {
                    $status = 'warning';
                    $message = "Calendly URL responded with status " . $response->status();
                }
            } catch (\Exception $e) {
                $status = 'error';
                $message = 'Could not verify Calendly URL: ' . $e->getMessage();
                $details['error'] = $e->getMessage();
            }
        }

        return $this->persist('calendly', 'Calendly', $status, $configured, $connected, $message, $details);
    }

    private function reverb(): array
    {
        $host = config('broadcasting.connections.reverb.options.host');
        $port = config('broadcasting.connections.reverb.options.port');
        $scheme = config('broadcasting.connections.reverb.options.scheme');
        $configured = !empty(config('broadcasting.connections.reverb.app_id'))
            && !empty(config('broadcasting.connections.reverb.app_key'))
            && !empty(config('broadcasting.connections.reverb.app_secret'));
        $message = '';
        $status = 'ok';
        $connected = false;
        $details = [
            'app_id' => config('broadcasting.connections.reverb.app_id') ? '****' : null,
            'app_key' => config('broadcasting.connections.reverb.app_key') ? '****' : null,
            'host' => $host,
            'port' => $port,
            'scheme' => $scheme,
        ];

        if (!$configured) {
            $message = 'Reverb WebSocket server is not configured. Set REVERB_APP_ID, REVERB_APP_KEY, and REVERB_APP_SECRET in your .env file.';
            $status = 'warning';
        } else {
            try {
                $testUrl = "{$scheme}://{$host}:{$port}";
                $response = Http::timeout(5)->get($testUrl);

                $connected = true;
                $message = "Reverb server at {$testUrl} is reachable.";
                $status = 'ok';
                $details['response_code'] = $response->status();
            } catch (\Exception $e) {
                $connected = false;
                $message = "Reverb WebSocket server is not reachable at {$scheme}://{$host}:{$port}. This is expected if the server is not running locally.";
                $status = 'warning';
            }
        }

        return $this->persist('reverb', 'Laravel Reverb (WebSocket)', $status, $configured, $connected, $message, $details);
    }

    private function s3(): array
    {
        $accessKey = config('filesystems.disks.s3.key') ?: env('AWS_ACCESS_KEY_ID');
        $secretKey = config('filesystems.disks.s3.secret') ?: env('AWS_SECRET_ACCESS_KEY');
        $bucket = config('filesystems.disks.s3.bucket') ?: env('AWS_BUCKET');
        $region = config('filesystems.disks.s3.region') ?: env('AWS_DEFAULT_REGION');
        $configured = !empty($accessKey) && !empty($secretKey) && !empty($bucket);
        $message = '';
        $status = 'ok';
        $connected = false;
        $details = [
            'has_access_key' => !empty($accessKey),
            'has_secret_key' => !empty($secretKey),
            'has_bucket' => !empty($bucket),
            'region' => $region ?: 'us-east-1',
            'disk' => config('filesystems.default'),
        ];

        if (!$configured) {
            $message = 'AWS S3 is not configured. File storage uses the local disk. This is fine for development.';
            $status = 'warning';
        } else {
            $connected = true;
            $message = "AWS S3 is configured. Bucket: {$bucket} ({$region}). File storage uses the \"{$details['disk']}\" disk.";
            $status = 'ok';
        }

        return $this->persist('s3', 'AWS S3 Storage', $status, $configured, $connected, $message, $details);
    }

    private function backendApi(): array
    {
        $url = config('app.url');
        $configured = !empty($url);
        $status = 'ok';
        $connected = false;
        $message = '';
        $details = [
            'base_url' => $url,
            'frontend_url' => config('app.frontend_url', $url),
        ];

        try {
            $response = Http::timeout(5)->get(rtrim($url, '/') . '/api/settings');

            if ($response->successful()) {
                $connected = true;
                $message = "Backend API is responding at {$url}";
                $status = 'ok';
                $details['response_code'] = $response->status();
            } else {
                $message = "Backend API returned status " . $response->status();
                $status = 'warning';
            }
        } catch (\Exception $e) {
            $message = "Backend API is not reachable at {$url}. Error: " . $e->getMessage();
            $status = 'error';
        }

        return $this->persist('backend_api', 'Backend API', $status, $configured, $connected, $message, $details);
    }

    private function googleFonts(): array
    {
        $configured = true;
        $status = 'ok';
        $connected = false;
        $message = '';
        $details = [
            'font_family' => 'Inter',
            'source' => 'fonts.googleapis.com',
        ];

        try {
            $response = Http::timeout(10)->get('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

            if ($response->successful()) {
                $connected = true;
                $message = 'Google Fonts is accessible. Inter font family is available.';
                $status = 'ok';
                $details['css_length'] = strlen($response->body());
            } else {
                $status = 'warning';
                $message = 'Google Fonts returned status ' . $response->status();
            }
        } catch (\Exception $e) {
            $status = 'error';
            $message = 'Could not reach Google Fonts: ' . $e->getMessage();
        }

        return $this->persist('google_fonts', 'Google Fonts', $status, $configured, $connected, $message, $details);
    }

    private function persist(
        string $key,
        string $name,
        string $status,
        bool $configured,
        bool $connected,
        string $message,
        array $details
    ): array {
        IntegrationTestResult::updateOrCreate(
            ['key' => $key],
            [
                'name' => $name,
                'status' => $status,
                'configured' => $configured,
                'connected' => $connected,
                'message' => $message,
                'details' => $details,
                'tested_at' => now(),
            ]
        );

        return [
            'key' => $key,
            'name' => $name,
            'status' => $status,
            'configured' => $configured,
            'connected' => $connected,
            'message' => $message,
            'details' => $details,
            'tested_at' => now()->toISOString(),
        ];
    }
}
