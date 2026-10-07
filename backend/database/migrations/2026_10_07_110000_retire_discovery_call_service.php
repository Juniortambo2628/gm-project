<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The free discovery call was retired at the client's request; only the paid
 * MBA and consulting packages are offered. Deactivate (not delete) so past
 * bookings keep their service.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('services')
            ->where('type', 'discovery')
            ->orWhere('name', 'Discovery Call')
            ->update(['is_active' => false, 'updated_at' => now()]);
    }

    public function down(): void
    {
        DB::table('services')
            ->where('type', 'discovery')
            ->orWhere('name', 'Discovery Call')
            ->update(['is_active' => true, 'updated_at' => now()]);
    }
};
