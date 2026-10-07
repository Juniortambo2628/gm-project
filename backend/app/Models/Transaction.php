<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'amount',
        'currency',
        'service_id',
        'stripe_payment_intent_id',
        'stripe_checkout_session_id',
        'calendly_invitee_uri',
        'status',
        'email_sent_at',
    ];

    protected $casts = [
        'email_sent_at' => 'datetime',
    ];

    /**
     * When an unpaid Calendly slot reservation is released (see bookings:release-unpaid).
     */
    public function holdExpiresAt(): Carbon
    {
        return $this->created_at->copy()->addMinutes((int) config('services.calendly.unpaid_hold_minutes', 120));
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function appointment()
    {
        return $this->hasOne(Appointment::class);
    }
}
