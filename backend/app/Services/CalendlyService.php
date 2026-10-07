<?php

namespace App\Services;

use Carbon\Carbon;
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
     * The booked slot for an invitee: ['start' => Carbon, 'end' => Carbon, 'status' => 'active'|'canceled'].
     * Without a Calendly webhook (paid plans only) this is how the site learns the time.
     */
    public function getBookedSlot(string $inviteeUri): ?array
    {
        $eventUri = $this->eventUriFromInviteeUri($inviteeUri);
        if (! $eventUri) {
            return null;
        }

        try {
            $response = $this->client()->get($eventUri);
            $event = $response->successful() ? $response->json('resource') : null;
            if (empty($event['start_time']) || empty($event['end_time'])) {
                return null;
            }

            return [
                'start' => Carbon::parse($event['start_time']),
                'end' => Carbon::parse($event['end_time']),
                'status' => $event['status'] ?? 'active',
            ];
        } catch (\Throwable $e) {
            Log::warning('Calendly event lookup failed: '.$e->getMessage());

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
