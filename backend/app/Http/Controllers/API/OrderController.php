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
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
        protected MailDeliveryService $mailDeliveryService,
        protected PaystackService $paystackService
    ) {}

    /**
     * Store a successful transaction record.
     * Verifies payment with Paystack API before recording.
     */
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $reference = $validated['paystack_ref'];

        // Idempotency: if this paystack_ref already exists, return it
        $existing = Transaction::where('paystack_ref', $reference)->first();
        if ($existing) {
            $existing->load('service');

            return response()->json([
                'status' => 'success',
                'message' => 'Transaction already recorded.',
                'data' => new TransactionResource($existing),
            ], 200);
        }

        // Verify payment with Paystack API
        $verified = $this->verifyPaystackTransaction($reference);
        if (! $verified) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment verification failed. The transaction could not be confirmed with Paystack.',
            ], 422);
        }

        // Use verified data from Paystack, not client input
        $amount = $verified['amount'] / 100; // Convert from kobo/cents
        $currency = $verified['currency'];
        $customerEmail = $verified['customer']['email'] ?? $validated['email'];
        $customerName = trim(($verified['customer']['first_name'] ?? '').' '.($verified['customer']['last_name'] ?? '')) ?: $validated['name'];

        $transaction = Transaction::create([
            'name' => $customerName,
            'email' => $customerEmail,
            'amount' => $amount,
            'currency' => $currency,
            'service_id' => $validated['service_id'],
            'paystack_ref' => $reference,
            'status' => 'success',
        ]);

        $transaction->load('service');

        $serviceName = $transaction->service?->name ?? 'Coaching Service';
        $scheduledAt = now()->addDays(2)->setTime(10, 0);
        $durationMinutes = $this->parseDurationMinutes($transaction->service?->duration);

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
            'transaction_id' => $transaction->paystack_ref,
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
                'paystack_ref' => $transaction->paystack_ref,
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
     * Verify a transaction reference against the Paystack API.
     */
    private function verifyPaystackTransaction(string $reference): ?array
    {
        return $this->paystackService->verifyTransaction($reference);
    }

    /**
     * Parse a duration string such as "60 minutes" into minutes.
     */
    private function parseDurationMinutes(?string $duration): int
    {
        return $this->paystackService->parseDurationMinutes($duration);
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
