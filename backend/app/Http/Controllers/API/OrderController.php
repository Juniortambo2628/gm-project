<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;

class OrderController extends Controller
{
    /**
     * Store a successful transaction record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'amount' => 'required|numeric',
            'currency' => 'required|string|max:10',
            'service_name' => 'required|string|max:255',
            'paystack_ref' => 'required|string|max:255',
            'status' => 'required|string',
        ]);

        $transaction = Transaction::create($validated);

        // Dispatch dynamic successful booking and payment emails to client
        try {
            \Illuminate\Support\Facades\Mail::to($transaction->email)->queue(
                new \App\Mail\DynamicSystemMail('payment_success', [
                    'name' => $transaction->name,
                    'service_name' => $transaction->service_name,
                    'amount' => $transaction->currency . ' ' . number_format($transaction->amount, 2),
                    'transaction_id' => $transaction->paystack_ref
                ])
            );

            \Illuminate\Support\Facades\Mail::to($transaction->email)->queue(
                new \App\Mail\DynamicSystemMail('booking_success', [
                    'name' => $transaction->name,
                    'service_name' => $transaction->service_name,
                    'date' => now()->addDays(2)->format('F d, Y'),
                    'time' => '10:00 AM (EAT)',
                    'amount' => $transaction->currency . ' ' . number_format($transaction->amount, 2),
                ])
            );
        } catch (\Exception $mailEx) {
            \Illuminate\Support\Facades\Log::error('Failed to dispatch booking/payment success emails: ' . $mailEx->getMessage());
        }

        // Create booking notification for admins
        try {
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'booking',
                    'title' => 'New Service Booking',
                    'message' => "{$transaction->name} completed payment of {$transaction->currency} " . number_format($transaction->amount, 2) . " for '{$transaction->service_name}'.",
                    'metadata' => [
                        'transaction_id' => $transaction->id,
                        'email' => $transaction->email,
                        'paystack_ref' => $transaction->paystack_ref,
                    ],
                    'is_read' => false
                ]);
            }
        } catch (\Exception $notifEx) {
            \Illuminate\Support\Facades\Log::error('Failed to create booking notification: ' . $notifEx->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction recorded successfully!',
            'data' => $transaction
        ], 201);
    }

    /**
     * List bookings for the authenticated user based on their email.
     */
    public function userBookings(Request $request)
    {
        $email = $request->user()->email;
        $bookings = Transaction::where('email', $email)->latest()->get();
        return response()->json($bookings);
    }

    /**
     * List all transactions (Admin).
     */
    public function index()
    {
        $transactions = Transaction::latest()->get();
        return response()->json($transactions);
    }
}
