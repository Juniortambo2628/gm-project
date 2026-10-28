<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\AppointmentResource;
use App\Http\Resources\MailLogResource;
use App\Http\Resources\MessageResource;
use App\Http\Resources\TransactionResource;
use App\Models\Appointment;
use App\Models\MailLog;
use App\Models\Message;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientController
{
    public function index(Request $request): JsonResponse
    {
        $activities = $this->activityQuery();
        $clients = DB::query()->fromSub($activities, 'client_activity')
            ->select('email')
            ->selectRaw('MAX(name) as name, MAX(activity_at) as last_activity, COUNT(*) as activity_count')
            ->selectRaw("MIN(CASE WHEN activity_type = 'account' THEN record_id END) as account_id")
            ->selectRaw("MIN(CASE WHEN activity_type = 'payment' THEN record_id END) as payment_id")
            ->selectRaw("MIN(CASE WHEN activity_type = 'inquiry' THEN record_id END) as inquiry_id")
            ->selectRaw("MIN(CASE WHEN activity_type = 'appointment' THEN record_id END) as appointment_id")
            ->selectRaw("MIN(CASE WHEN activity_type = 'email' THEN record_id END) as email_id")
            ->groupBy('email');

        if ($search = trim((string) $request->query('q'))) {
            $clients->where(function (Builder $builder) use ($search) {
                $builder->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $page = $clients->orderByDesc('last_activity')->paginate(20)->through(function ($client) {
            foreach (['account', 'payment', 'inquiry', 'appointment', 'email'] as $source) {
                $id = $client->{$source.'_id'};
                if ($id) {
                    $client->source_type = $source;
                    $client->source_id = (int) $id;
                    break;
                }
            }

            $client->name = $client->name ?: $client->email;

            return $client;
        });

        return response()->json($page);
    }

    public function show(string $sourceType, int $sourceId): JsonResponse
    {
        $email = match ($sourceType) {
            'account' => User::withTrashed()->findOrFail($sourceId)->email,
            'payment' => Transaction::withTrashed()->findOrFail($sourceId)->email,
            'inquiry' => Message::withTrashed()->findOrFail($sourceId)->email,
            'appointment' => Appointment::query()->findOrFail($sourceId)->client_email,
            'email' => MailLog::query()->findOrFail($sourceId)->recipient,
            default => abort(404),
        };
        $email = mb_strtolower(trim($email));

        $profile = User::withTrashed()->whereRaw('LOWER(email) = ?', [$email])->first();
        $transactions = Transaction::withTrashed()->whereRaw('LOWER(email) = ?', [$email])
            ->with(['service', 'appointment'])->latest()->limit(25)->get();
        $messages = Message::withTrashed()->whereRaw('LOWER(email) = ?', [$email])
            ->latest()->limit(25)->get();
        $appointments = Appointment::query()->whereRaw('LOWER(client_email) = ?', [$email])
            ->with(['service', 'transaction', 'documents'])->latest()->limit(25)->get();
        $emails = MailLog::query()->whereRaw('LOWER(recipient) = ?', [$email])
            ->latest()->limit(25)->get();

        $name = $profile?->name
            ?? $transactions->first()?->name
            ?? $appointments->first()?->client_name
            ?? $messages->first()?->name
            ?? $email;

        return response()->json([
            'client' => [
                'name' => $name,
                'email' => $email,
                'account' => $profile ? [
                    'id' => $profile->id,
                    'role' => $profile->role,
                    'created_at' => $profile->created_at?->toISOString(),
                    'deleted_at' => $profile->deleted_at?->toISOString(),
                ] : null,
            ],
            'payments' => TransactionResource::collection($transactions),
            'inquiries' => MessageResource::collection($messages),
            'appointments' => AppointmentResource::collection($appointments),
            'emails' => MailLogResource::collection($emails),
        ]);
    }

    private function activityQuery(): Builder
    {
        // Keep archived accounts visible so their retained business history remains discoverable.
        $accounts = DB::table('users')
            ->selectRaw("LOWER(email) as email, name, created_at as activity_at, 'account' as activity_type, id as record_id");
        $payments = DB::table('transactions')->whereNull('deleted_at')
            ->selectRaw("LOWER(email) as email, name, created_at as activity_at, 'payment' as activity_type, id as record_id");
        $inquiries = DB::table('messages')->whereNull('deleted_at')
            ->selectRaw("LOWER(email) as email, name, created_at as activity_at, 'inquiry' as activity_type, id as record_id");
        $appointments = DB::table('appointments')
            ->selectRaw("LOWER(client_email) as email, client_name as name, created_at as activity_at, 'appointment' as activity_type, id as record_id");
        $emails = DB::table('mail_logs')
            ->selectRaw("LOWER(recipient) as email, NULL as name, created_at as activity_at, 'email' as activity_type, id as record_id");

        return $accounts->unionAll($payments)->unionAll($inquiries)->unionAll($appointments)->unionAll($emails);
    }
}
