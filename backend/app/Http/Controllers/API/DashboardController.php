<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Transaction;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get overview analytics for the dashboard
     */
    public function index()
    {
        $messagesCount = Message::count();
        $transactionsCount = Transaction::where('status', 'success')->count();
        
        $totalRevenue = Transaction::where('status', 'success')->sum('amount');
        
        // Fetch recent items
        $recentMessages = Message::orderBy('created_at', 'desc')->take(5)->get();
        $recentTransactions = Transaction::where('status', 'success')->orderBy('created_at', 'desc')->take(5)->get();
        
        // Calculate revenue for current month
        $currentMonthRevenue = Transaction::where('status', 'success')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('amount');

        return response()->json([
            'stats' => [
                'total_messages' => $messagesCount,
                'total_transactions' => $transactionsCount,
                'total_revenue' => $totalRevenue,
                'current_month_revenue' => $currentMonthRevenue
            ],
            'recent_messages' => $recentMessages,
            'recent_transactions' => $recentTransactions
        ]);
    }
}
