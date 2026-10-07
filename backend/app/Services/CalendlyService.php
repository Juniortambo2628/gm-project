<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CalendlyService
{
    private const API_BASE = 'https://api.calendly.com/';

    public function isConfigured(): bool
    {
        return ! empty(config('services.calendly.api_token'));
    }

    /**
     * Fetch an invitee (email, status) by its API URI. Returns null on failure.
     */
    public function getInvitee(string $inviteeUri): ?array
    {
        if (! $this->isCalendlyUri($inviteeUri)) {
            return null;
        }

        try {
            $response = $this->client()->get($inviteeUri);

            return $response->successful() ? ($response->json('resource') ?? null) : null;
        } catch (\Throwable $e) {
            Log::warning('Calendly invitee lookup failed: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Cancel the scheduled event an invitee belongs to. Calendly emails the
     * invitee the cancellation with the given reason, freeing the slot.
     */
    public function cancelEventForInvitee(string $inviteeUri, string $reason): bool
    {
        $eventUri = $this->eventUriFromInviteeUri($inviteeUri);
        if (! $eventUri) {
            return false;
        }

        try {
            $response = $this->client()->post($eventUri.'/cancellation', ['reason' => $reason]);

            if ($response->successful()) {
                return true;
            }

            Log::warning('Calendly cancellation failed', [
                'event' => $eventUri,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::warning('Calendly cancellation failed: '.$e->getMessage());

            return false;
        }
    }

    /**
     * https://api.calendly.com/scheduled_events/{event}/invitees/{invitee}
     *   -> https://api.calendly.com/scheduled_events/{event}
     */
    public function eventUriFromInviteeUri(string $inviteeUri): ?string
    {
        if (! $this->isCalendlyUri($inviteeUri)
            || ! preg_match('#^(https://api\.calendly\.com/scheduled_events/[^/]+)/invitees/[^/]+$#', $inviteeUri, $m)) {
            return null;
        }

        return $m[1];
    }

    private function isCalendlyUri(string $uri): bool
    {
        return str_starts_with($uri, self::API_BASE);
    }

    private function client(): PendingRequest
    {
        return Http::withToken((string) config('services.calendly.api_token'))
            ->acceptJson()
            ->timeout(10);
    }
}
