<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentVerificationController extends Controller
{
    public function __construct(
        protected PaystackService $paystackService
    ) {}

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
        $data = $this->paystackService->verifyTransaction($reference);

        if (! $data) {
            return response()->json([
                'verified' => false,
                'message' => 'Transaction not found or verification failed',
            ], 400);
        }

        return response()->json([
            'verified' => true,
            'data' => [
                'reference' => $data['reference'],
                'amount' => $data['amount'] / 100,
                'currency' => $data['currency'],
                'customer_email' => $data['customer']['email'] ?? '',
                'customer_name' => trim(($data['customer']['first_name'] ?? '').' '.($data['customer']['last_name'] ?? '')),
                'metadata' => $data['metadata'] ?? [],
                'paid_at' => $data['paid_at'],
            ],
        ]);
    }
}
