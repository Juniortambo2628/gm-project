<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateMailTemplateRequest;
use App\Http\Resources\MailTemplateResource;
use App\Mail\DynamicSystemMail;
use App\Models\MailTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class MailTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        $templates = MailTemplate::query()->orderBy('name')->get();

        if ($templates->isEmpty()) {
            foreach (MailTemplate::defaultTemplates() as $default) {
                MailTemplate::create($default);
            }
            $templates = MailTemplate::query()->orderBy('name')->get();
        }

        return response()->json(MailTemplateResource::collection($templates));
    }

    public function show(string $key): JsonResponse
    {
        $template = MailTemplate::forKey($key);

        return response()->json(new MailTemplateResource($template));
    }

    public function update(UpdateMailTemplateRequest $request, string $key): JsonResponse
    {
        $template = MailTemplate::forKey($key);

        $template->update($request->validated());

        return response()->json([
            'message' => 'Email template updated successfully.',
            'data' => new MailTemplateResource($template),
        ]);
    }

    public function preview(string $key): JsonResponse
    {
        $template = MailTemplate::forKey($key);

        $placeholders = $this->samplePlaceholders($key);

        try {
            $mailable = new DynamicSystemMail($key, $placeholders);

            return response()->json([
                'subject' => $mailable->mailSubject,
                'html' => $mailable->htmlContent,
                'placeholders' => $placeholders,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to generate email preview for {$key}: ".$e->getMessage());

            return response()->json([
                'message' => 'Unable to generate preview.',
            ], 500);
        }
    }

    public function reset(string $key): JsonResponse
    {
        $template = MailTemplate::forKey($key);
        $template->resetToDefault();

        return response()->json([
            'message' => 'Email template reset to default.',
            'data' => new MailTemplateResource($template),
        ]);
    }

    /**
     * Provide sample placeholder values for preview rendering.
     */
    protected function samplePlaceholders(string $key): array
    {
        $common = [
            'name' => 'Jane Doe',
            'app_name' => config('app.name', 'Gathoni Mwai Coaching'),
            'frontend_url' => config('app.frontend_url', config('app.url', 'https://example.com')),
            'current_year' => (string) now()->year,
        ];

        $specific = match ($key) {
            'forgot_password', 'two_factor' => [
                'code' => '123456',
            ],
            'payment_success' => [
                'amount' => 'KES 25,000.00',
                'service_name' => 'MBA Admissions Coaching',
                'transaction_id' => 'PAY-ABC123XYZ',
                'date' => now()->addDays(2)->format('F d, Y'),
                'time' => '10:00 AM (EAT)',
            ],
            'booking_success' => [
                'service_name' => 'Consulting Interview Prep',
                'date' => now()->addDays(2)->format('F d, Y'),
                'time' => '10:00 AM (EAT)',
                'duration' => '60 minutes',
                'amount' => 'KES 25,000.00',
            ],
            'booking_reminder' => [
                'service_name' => 'Consulting Interview Prep',
                'date' => now()->addDay()->format('F d, Y'),
                'time' => '10:00 AM (EAT)',
                'duration' => '60 minutes',
            ],
            'meeting_followup' => [
                'service_name' => 'Consulting Interview Prep',
                'date' => now()->subDay()->format('F d, Y'),
                'time' => '10:00 AM (EAT)',
            ],
            'inquiry_received' => [
                'email' => 'client@example.com',
                'subject' => 'MBA Admissions Inquiry',
                'country' => 'Kenya',
                'message' => 'I would love to learn more about the MBA admissions coaching package.',
                'admin_url' => config('app.frontend_url', config('app.url', 'https://example.com')).'/admin',
            ],
            'inquiry_auto_reply' => [
                'subject' => 'MBA Admissions Inquiry',
            ],
            default => [],
        };

        return array_merge($common, $specific);
    }
}
