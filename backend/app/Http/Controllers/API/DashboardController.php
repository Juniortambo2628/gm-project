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

        $currentMonthRevenue = $this->revenueForMonth(Carbon::now());
        $previousMonthRevenue = $this->revenueForMonth(Carbon::now()->subMonthNoOverflow());

        return response()->json([
            'stats' => [
                'total_messages' => $messagesCount,
                'total_transactions' => $transactionsCount,
                'total_revenue' => (float) $totalRevenue,
                'current_month_revenue' => $currentMonthRevenue,
                'previous_month_revenue' => $previousMonthRevenue,
            ],
            'revenue_series' => $this->revenueSeries(),
            'recent_messages' => MessageResource::collection($recentMessages),
            'recent_transactions' => TransactionResource::collection($recentTransactions),
        ]);
    }

    /**
     * Total successful revenue for the calendar month of the given date.
     */
    private function revenueForMonth(Carbon $date): float
    {
        return (float) Transaction::query()
            ->where('status', 'success')
            ->whereYear('created_at', $date->year)
            ->whereMonth('created_at', $date->month)
            ->sum('amount');
    }

    /**
     * Successful revenue for each of the last six calendar months, oldest
     * first, for the dashboard "Revenue overview" chart.
     *
     * @return array<int, array{month: string, year: int, total: float}>
     */
    private function revenueSeries(int $months = 6): array
    {
        $series = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subMonthsNoOverflow($i);
            $series[] = [
                'month' => $date->format('M'),
                'year' => $date->year,
                'total' => $this->revenueForMonth($date),
            ];
        }

        return $series;
    }
}
