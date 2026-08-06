<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    /**
     * Verify a Paystack transaction by reference.
     *
     * @return array<string, mixed>|null  The transaction data payload, or null on failure.
     */
    public function verifyTransaction(string $reference): ?array
    {
        $secret = config('services.paystack.secret');

        if (! $secret) {
            Log::error('Paystack secret key not configured');

            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$secret,
                'Content-Type' => 'application/json',
            ])->timeout(10)->get("https://api.paystack.co/transaction/verify/{$reference}");

            if ($response->successful() && $response->json('status') === true) {
                $data = $response->json('data');

                if ($data['status'] === 'success') {
                    return $data;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Paystack verification API error: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Parse a duration string (e.g. "60 minutes", "1h 30m") into minutes.
     */
    public function parseDurationMinutes(?string $duration): int
    {
        if (! $duration) {
            return 60;
        }

        if (preg_match('/(\d+)/', $duration, $matches)) {
            return max(15, (int) $matches[1]);
        }

        return 60;
    }
}
