<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'calendly_invitee_uri',
        'service_id',
        'user_id',
        'client_name',
        'client_email',
        'scheduled_at',
        'duration_minutes',
        'status',
        'reminder_sent_at',
        'followup_sent_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'reminder_sent_at' => 'datetime',
            'followup_sent_at' => 'datetime',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Link a paid transaction to the Calendly slot the client picked before paying.
     *
     * Matches on the Calendly invitee URI first; falls back to the client's most
     * recent unpaid upcoming booking made in the last day.
     */
    public static function attachToTransaction(Transaction $transaction): ?self
    {
        if ($transaction->appointment) {
            return $transaction->appointment;
        }

        $appointment = null;

        if ($transaction->calendly_invitee_uri) {
            $appointment = self::where('calendly_invitee_uri', $transaction->calendly_invitee_uri)
                ->whereNull('transaction_id')
                ->first();
        }

        $appointment ??= self::where('client_email', $transaction->email)
            ->whereNull('transaction_id')
            ->where('status', 'scheduled')
            ->where('scheduled_at', '>', now())
            ->where('created_at', '>=', now()->subDay())
            ->latest()
            ->first();

        if (! $appointment) {
            return null;
        }

        $appointment->update([
            'transaction_id' => $transaction->id,
            'service_id' => $transaction->service_id ?? $appointment->service_id,
        ]);
        $transaction->setRelation('appointment', $appointment);

        return $appointment;
    }

    public function markReminderSent(): void
    {
        $this->update(['reminder_sent_at' => now()]);
    }

    public function markFollowupSent(): void
    {
        $this->update(['followup_sent_at' => now(), 'status' => 'completed']);
    }

    public function getEndTime(): Carbon
    {
        return $this->scheduled_at->copy()->addMinutes($this->duration_minutes);
    }
}
