<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Appointment;
use App\Models\Transaction;
use App\Services\MailDeliveryService;
use App\Services\NotificationService;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
        protected MailDeliveryService $mailDeliveryService,
        protected StripeService $stripeService
    ) {}

    /**
     * Store a successful transaction record.
     * Called after Stripe Checkout webhook confirms payment.
     */
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $checkoutSessionId = $validated['stripe_checkout_session_id'];

        // Idempotency: if this session already exists, return it
        $existing = Transaction::where('stripe_checkout_session_id', $checkoutSessionId)->first();
        if ($existing) {
            $existing->load('service');

            return response()->json([
                'status' => 'success',
                'message' => 'Transaction already recorded.',
                'data' => new TransactionResource($existing),
            ], 200);
        }

        // Verify payment with Stripe API
        $session = $this->stripeService->getCheckoutSession($checkoutSessionId);
        if (! $session || $session->payment_status !== 'paid') {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment verification failed. The transaction could not be confirmed with Stripe.',
            ], 422);
        }

        // Use verified data from Stripe, not client input
        $amount = ($session->amount_total ?? 0) / 100;
        $currency = strtoupper($session->currency ?? 'gbp');
        $metadata = $session->metadata ? (array) $session->metadata : [];
        $customerEmail = $session->customer_email ?? $metadata['customer_email'] ?? $validated['email'];
        $customerName = $metadata['customer_name'] ?? $validated['name'];
        $paymentIntentId = $session->payment_intent;

        $transaction = Transaction::create([
            'name' => $customerName,
            'email' => $customerEmail,
            'amount' => $amount,
            'currency' => $currency,
            'service_id' => $validated['service_id'],
            'stripe_payment_intent_id' => $paymentIntentId,
            'stripe_checkout_session_id' => $checkoutSessionId,
            'status' => 'success',
        ]);

        $transaction->load('service');

        $serviceName = $transaction->service?->name ?? 'Coaching Service';
        $scheduledAt = now()->addDays(2)->setTime(10, 0);
        $durationMinutes = $this->stripeService->parseDurationMinutes($transaction->service?->duration);

        $appointment = Appointment::create([
            'transaction_id' => $transaction->id,
            'service_id' => $transaction->service_id,
            'user_id' => $request->user()->id,
            'client_name' => $transaction->name,
            'client_email' => $transaction->email,
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => $durationMinutes,
            'status' => 'scheduled',
        ]);

        // Dispatch dynamic successful booking and payment emails to client
        $this->mailDeliveryService->send($transaction->email, 'payment_success', [
            'name' => $transaction->name,
            'service_name' => $serviceName,
            'amount' => $transaction->currency.' '.number_format($transaction->amount, 2),
            'transaction_id' => $transaction->stripe_payment_intent_id ?? $checkoutSessionId,
            'date' => $scheduledAt->format('F d, Y'),
            'time' => $scheduledAt->format('g:i A (T)'),
        ]);

        $this->mailDeliveryService->send($transaction->email, 'booking_success', [
            'name' => $transaction->name,
            'service_name' => $serviceName,
            'date' => $scheduledAt->format('F d, Y'),
            'time' => $scheduledAt->format('g:i A (T)'),
            'duration' => $durationMinutes.' minutes',
            'amount' => $transaction->currency.' '.number_format($transaction->amount, 2),
        ]);

        $transaction->update(['email_sent_at' => now()]);

        $this->notificationService->notifyAdmins(
            'booking',
            'New Service Booking',
            "{$transaction->name} completed payment of {$transaction->currency} ".number_format($transaction->amount, 2)." for '{$serviceName}'.",
            [
                'transaction_id' => $transaction->id,
                'email' => $transaction->email,
                'stripe_session_id' => $checkoutSessionId,
                'appointment_id' => $appointment->id,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction recorded successfully!',
            'data' => new TransactionResource($transaction),
        ], 201);
    }

    /**
     * List bookings for the authenticated user based on their email.
     */
    public function userBookings(Request $request): JsonResponse
    {
        $email = $request->user()->email;
        $bookings = Transaction::query()
            ->where('email', $email)
            ->with('service')
            ->latest()
            ->paginate(15);

        return TransactionResource::collection($bookings)->response();
    }

    /**
     * Show a single booking for the authenticated user.
     */
    public function showUserBooking(Request $request, $id): JsonResponse
    {
        $booking = Transaction::query()
            ->where('email', $request->user()->email)
            ->where('id', $id)
            ->with('service')
            ->firstOrFail();

        return (new TransactionResource($booking))->response();
    }

    /**
     * List all transactions (Admin).
     */
    public function index(): JsonResponse
    {
        $transactions = Transaction::query()
            ->with('service')
            ->latest()
            ->paginate(15);

        return TransactionResource::collection($transactions)->response();
    }

    /**
     * Show a single transaction (Admin).
     */
    public function show($id): JsonResponse
    {
        $transaction = Transaction::query()
            ->with('service')
            ->findOrFail($id);

        return (new TransactionResource($transaction))->response();
    }

    /**
     * Update the status of a transaction (Admin).
     */
    public function updateStatus(UpdateOrderStatusRequest $request, $id): JsonResponse
    {
        $transaction = Transaction::query()->findOrFail($id);
        $transaction->update($request->validated());

        return response()->json([
            'message' => 'Order status updated successfully',
            'data' => new TransactionResource($transaction),
        ]);
    }
}
