<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentDocument extends Model
{
    protected $fillable = ['appointment_id', 'path', 'original_name', 'mime_type', 'size_bytes'];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
