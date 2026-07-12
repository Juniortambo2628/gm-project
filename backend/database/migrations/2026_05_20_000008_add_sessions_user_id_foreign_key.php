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
        // Foreign keys require both participating tables to use InnoDB.
        // Skip on SQLite (used in testing) as it doesn't have information_schema.
        if (DB::getDriverName() !== 'sqlite') {
            $db = env('DB_DATABASE');
            $tables = DB::select("SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('sessions', 'users')", [$db]);
            foreach ($tables as $t) {
                if (strtolower($t->ENGINE) === 'myisam') {
                    DB::statement("ALTER TABLE {$t->TABLE_NAME} ENGINE=InnoDB");
                }
            }
        }

        Schema::table('sessions', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }
};
