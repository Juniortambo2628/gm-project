<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentVerificationController extends Controller
{
    /**
     * Verify a Paystack transaction reference server-side.
     * Called by frontend after the Paystack popup succeeds, before recording the transaction.
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string|max:255',
        ]);

        $reference = $request->input('reference');
        $secret = config('services.paystack.secret');

        if (! $secret) {
            Log::error('Paystack secret key not configured');
            return response()->json(['verified' => false, 'message' => 'Payment service not configured'], 500);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $secret,
                'Content-Type' => 'application/json',
            ])->timeout(10)->get("https://api.paystack.co/transaction/verify/{$reference}");

            if (! $response->successful()) {
                Log::warning('Paystack verify API returned non-200', [
                    'reference' => $reference,
                    'status' => $response->status(),
                ]);
                return response()->json([
                    'verified' => false,
                    'message' => 'Payment verification failed',
                ], 400);
            }

            $body = $response->json();

            if ($body['status'] !== true || ! isset($body['data'])) {
                return response()->json([
                    'verified' => false,
                    'message' => $body['message'] ?? 'Transaction not found',
                ], 400);
            }

            $data = $body['data'];

            // Verify the transaction was successful
            if ($data['status'] !== 'success') {
                return response()->json([
                    'verified' => false,
                    'message' => 'Transaction was not successful: ' . $data['status'],
                ], 400);
            }

            // Return verified transaction data for frontend to use when recording
            return response()->json([
                'verified' => true,
                'data' => [
                    'reference' => $data['reference'],
                    'amount' => $data['amount'] / 100, // Convert from kobo
                    'currency' => $data['currency'],
                    'customer_email' => $data['customer']['email'] ?? '',
                    'customer_name' => trim(($data['customer']['first_name'] ?? '') . ' ' . ($data['customer']['last_name'] ?? '')),
                    'metadata' => $data['metadata'] ?? [],
                    'paid_at' => $data['paid_at'],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Paystack verification error: ' . $e->getMessage(), ['reference' => $reference]);
            return response()->json([
                'verified' => false,
                'message' => 'Unable to verify payment at this time',
            ], 500);
        }
    }
}
