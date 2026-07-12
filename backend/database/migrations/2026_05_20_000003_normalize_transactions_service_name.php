<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('service_id')->nullable()->after('service_name')->index();
            $table->foreign('service_id')->references('id')->on('services')->nullOnDelete();
        });

        // Backfill service_id by matching service_name against services.name.
        // Done in PHP to stay DB-agnostic and avoid correlated subquery quirks.
        $services = DB::table('services')->select('id', 'name')->get();
        foreach ($services as $service) {
            DB::table('transactions')
                ->where('service_name', $service->name)
                ->update(['service_id' => $service->id]);
        }

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('service_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('service_name')->nullable()->after('currency');
        });

        // Restore service_name values from the related services where possible.
        $services = DB::table('services')->select('id', 'name')->get();
        foreach ($services as $service) {
            DB::table('transactions')
                ->where('service_id', $service->id)
                ->update(['service_name' => $service->name]);
        }

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropIndex(['service_id']);
            $table->dropColumn('service_id');
        });
    }
};
