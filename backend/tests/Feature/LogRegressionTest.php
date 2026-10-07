<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Tests\TestCase;

/**
 * Regressions for errors seen in the production Laravel log.
 */
class LogRegressionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 2026-09-04: PNG uploads crashed with "Image::encode(): Argument #1 ($encoder)
     * must be of type EncoderInterface, string given".
     */
    public function test_admin_can_upload_png_gif_and_jpeg_images(): void
    {
        Storage::fake('public');
        $admin = $this->createAdmin();

        foreach (['png', 'gif', 'jpg'] as $ext) {
            $file = UploadedFile::fake()->image("hero.{$ext}", 2400, 1200);

            $this->withHeaders(['Accept' => 'application/json', 'Authorization' => $this->jsonHeaders($admin)['Authorization']])
                ->post('/api/cms/upload', ['key' => "test_{$ext}", 'file' => $file])
                ->assertOk()
                ->assertJsonStructure(['url', 'path']);
        }
    }

    /**
     * 2026-10-07: every email failed with 'The "tcp" scheme is not supported'
     * when MAIL_SCHEME was unset or set to "tcp".
     *
     * @return array<string, array{0: ?string, 1: ?string, 2: string, 3: bool}>
     */
    public static function mailSchemeCases(): array
    {
        return [
            'unset, port 587' => [null, null, '587', false],
            'tcp (old .env.example advice)' => ['tcp', null, '587', false],
            'tls encryption' => [null, 'tls', '587', false],
            'smtp' => ['smtp', null, '587', false],
            'smtps' => ['smtps', null, '465', true],
            'unset, port 465' => [null, null, '465', true],
            'ssl encryption' => [null, 'ssl', '465', true],
        ];
    }

    #[DataProvider('mailSchemeCases')]
    public function test_smtp_transport_builds_for_common_mail_settings(?string $scheme, ?string $encryption, string $port, bool $tls): void
    {
        foreach (['MAIL_SCHEME' => $scheme, 'MAIL_ENCRYPTION' => $encryption, 'MAIL_PORT' => $port] as $key => $value) {
            if ($value === null) {
                putenv($key);
                unset($_ENV[$key], $_SERVER[$key]);
            } else {
                putenv("{$key}={$value}");
                $_ENV[$key] = $_SERVER[$key] = $value;
            }
        }

        $mailConfig = require config_path('mail.php');
        config(['mail.mailers.smtp' => array_merge($mailConfig['mailers']['smtp'], ['host' => 'smtp.example.com'])]);
        app('mail.manager')->purge('smtp');

        $transport = app('mail.manager')->mailer('smtp')->getSymfonyTransport();

        $this->assertInstanceOf(EsmtpTransport::class, $transport);
        $this->assertSame($tls, $transport->getStream()->isTLS());
    }
}
