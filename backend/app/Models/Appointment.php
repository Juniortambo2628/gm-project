<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
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

    public function markReminderSent(): void
    {
        $this->update(['reminder_sent_at' => now()]);
    }

    public function markFollowupSent(): void
    {
        $this->update(['followup_sent_at' => now(), 'status' => 'completed']);
    }

    public function getEndTime(): \Carbon\Carbon
    {
        return $this->scheduled_at->copy()->addMinutes($this->duration_minutes);
    }
}
