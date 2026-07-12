<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Explicitly sizes indexed string columns to 191 so they remain safe
     * under MySQL utf8mb4, regardless of the global default string length.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->string('email', 191)->change();
            $table->unique('email');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->string('slug', 191)->change();
            $table->unique('slug');
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropUnique(['token']);
            $table->string('token', 191)->change();
            $table->unique('token');
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->dropUnique(['key']);
            $table->string('key', 191)->change();
            $table->unique('key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->string('email')->change();
            $table->unique('email');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->string('slug')->change();
            $table->unique('slug');
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropUnique(['token']);
            $table->string('token', 64)->change();
            $table->unique('token');
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->dropUnique(['key']);
            $table->string('key')->change();
            $table->unique('key');
        });
    }
};
