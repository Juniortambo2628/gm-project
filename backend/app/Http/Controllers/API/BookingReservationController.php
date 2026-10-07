<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingReservationController extends Controller
{
    /**
     * Record a Calendly slot the client just picked for a paid session.
     *
     * The slot is held as a pending transaction; if it isn't paid within the
     * hold window, bookings:release-unpaid cancels it on Calendly.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'calendly_invitee_uri' => 'required|string|max:255|starts_with:https://api.calendly.com/',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $service = Service::findOrFail($validated['service_id']);
        $user = $request->user();

        if ($service->price <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Free sessions do not need a reservation.',
            ], 422);
        }

        $reservation = Transaction::firstOrCreate(
            ['calendly_invitee_uri' => $validated['calendly_invitee_uri']],
            [
                'name' => $validated['name'] ?? $user->name,
                'email' => $validated['email'] ?? $user->email,
                'amount' => $service->price,
                'currency' => strtoupper($service->currency ?? 'GBP'),
                'service_id' => $service->id,
                'status' => 'pending',
            ]
        );

        return response()->json([
            'status' => 'success',
            'data' => [
                'transaction_status' => $reservation->status,
                'hold_expires_at' => $reservation->holdExpiresAt()->toIso8601String(),
            ],
        ], $reservation->wasRecentlyCreated ? 201 : 200);
    }
}
