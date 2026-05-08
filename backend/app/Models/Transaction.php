<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'name',
        'email',
        'amount',
        'currency',
        'service_name',
        'paystack_ref',
        'status',
    ];
}
