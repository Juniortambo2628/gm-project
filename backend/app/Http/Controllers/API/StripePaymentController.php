<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Transaction;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StripePaymentController extends Controller
{
    public function __construct(
        protected StripeService $stripeService
    ) {}

    /**
     * Create a Stripe Checkout Session.
     * Called by the frontend when the user clicks "Confirm & Pay".
     */
    public function createCheckoutSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        $service = Service::findOrFail($validated['service_id']);

        $amountInPence = (int) ($service->price * 100); // Convert to pence/cents
        $currency = strtolower($service->currency ?? 'gbp');

        $session = $this->stripeService->createCheckoutSession(
            serviceName: $service->name,
            amountInPence: $amountInPence,
            currency: $currency,
            customerEmail: $validated['email'],
            customerName: $validated['name'],
            metadata: [
                'service_id' => (string) $service->id,
                'service_name' => $service->name,
            ]
        );

        if (! $session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create checkout session. Please try again.',
            ], 500);
        }

        // Pre-create a pending transaction so the webhook can find it
        Transaction::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'amount' => $service->price,
            'currency' => strtoupper($currency),
            'service_id' => $service->id,
            'stripe_checkout_session_id' => $session->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'checkout_url' => $session->url,
                'session_id' => $session->id,
            ],
        ]);
    }

    /**
     * Check the status of a Checkout Session.
     * Called by the frontend after redirect to confirm payment.
     */
    public function status(Request $request, string $sessionId): JsonResponse
    {
        $session = $this->stripeService->getCheckoutSession($sessionId);

        if (! $session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session not found.',
            ], 404);
        }

        $transaction = Transaction::where('stripe_checkout_session_id', $sessionId)->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'payment_status' => $session->payment_status,
                'transaction_status' => $transaction?->status ?? 'pending',
                'transaction_id' => $transaction?->id,
            ],
        ]);
    }
}
