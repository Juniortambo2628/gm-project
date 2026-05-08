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

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction recorded successfully!',
            'data' => $transaction
        ], 201);
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
