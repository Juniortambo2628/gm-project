<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
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
     * Called by the frontend when the user clicks "Confirm & Pay", after they
     * have already reserved a slot on Calendly.
     */
    public function createCheckoutSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'calendly_invitee_uri' => 'nullable|string|max:255|starts_with:https://api.calendly.com/',
            'calendly_event_uri' => 'nullable|string|max:255|starts_with:https://api.calendly.com/',
        ]);

        $service = Service::findOrFail($validated['service_id']);

        // The slot reservation recorded when the client picked a time (see BookingReservationController).
        $reservation = ! empty($validated['calendly_invitee_uri'])
            ? Transaction::where('calendly_invitee_uri', $validated['calendly_invitee_uri'])->first()
            : null;

        if ($reservation?->status === 'cancelled') {
            return response()->json([
                'status' => 'error',
                'code' => 'slot_released',
                'message' => 'Your reserved time slot was released because payment was not completed in time. Please pick a new time.',
            ], 410);
        }

        if ($reservation?->status === 'success') {
            return response()->json([
                'status' => 'error',
                'message' => 'This booking has already been paid for.',
            ], 409);
        }

        if (! $this->stripeService->isConfigured()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment system is not configured. Please contact support.',
            ], 503);
        }

        $amountInPence = (int) ($service->price * 100); // Convert to pence/cents
        $currency = strtolower($service->currency ?? 'gbp');

        // Let the checkout lapse around when the reservation would be released, so a
        // client can't pay for a slot that has been freed. Stripe allows 30 min to 24 h.
        $expiresAt = $reservation
            ? min(max($reservation->holdExpiresAt()->timestamp, now()->addMinutes(31)->timestamp), now()->addHours(23)->timestamp)
            : null;

        $session = $this->stripeService->createCheckoutSession(
            serviceName: $service->name,
            amountInPence: $amountInPence,
            currency: $currency,
            customerEmail: $validated['email'],
            customerName: $validated['name'],
            metadata: array_filter([
                'service_id' => (string) $service->id,
                'service_name' => $service->name,
                'calendly_invitee_uri' => $validated['calendly_invitee_uri'] ?? null,
                'calendly_event_uri' => $validated['calendly_event_uri'] ?? null,
            ]),
            expiresAt: $expiresAt,
        );

        if (! $session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create checkout session. Please try again.',
            ], 500);
        }

        // Pending transaction so the webhook can find it (reuses the slot reservation if any)
        $attributes = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'amount' => $service->price,
            'currency' => strtoupper($currency),
            'service_id' => $service->id,
            'stripe_checkout_session_id' => $session->id,
            'calendly_invitee_uri' => $validated['calendly_invitee_uri'] ?? null,
            'status' => 'pending',
        ];

        if ($reservation) {
            $reservation->update($attributes);
        } else {
            Transaction::create($attributes);
        }

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

        // Self-heal when the webhook never arrived.
        if ($transaction && $transaction->status !== 'success') {
            if ($this->stripeService->reconcilePendingTransaction($transaction)) {
                Appointment::attachToTransaction($transaction);
            }
        }

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
