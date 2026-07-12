<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Http\Resources\TransactionResource;
use App\Models\Message;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get overview analytics for the dashboard
     */
    public function index(): JsonResponse
    {
        $messagesCount = Message::query()->count();
        $transactionsCount = Transaction::query()->where('status', 'success')->count();
        $totalRevenue = Transaction::query()->where('status', 'success')->sum('amount');

        $recentMessages = Message::query()
            ->latest()
            ->take(5)
            ->get();

        $recentTransactions = Transaction::query()
            ->where('status', 'success')
            ->with('service')
            ->latest()
            ->take(5)
            ->get();

        $currentMonthRevenue = Transaction::query()
            ->where('status', 'success')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('amount');

        return response()->json([
            'stats' => [
                'total_messages' => $messagesCount,
                'total_transactions' => $transactionsCount,
                'total_revenue' => $totalRevenue,
                'current_month_revenue' => $currentMonthRevenue,
            ],
            'recent_messages' => MessageResource::collection($recentMessages),
            'recent_transactions' => TransactionResource::collection($recentTransactions),
        ]);
    }
}
