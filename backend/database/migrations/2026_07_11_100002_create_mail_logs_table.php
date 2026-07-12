<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('mail_logs')) {
            return;
        }

        Schema::create('mail_logs', function (Blueprint $table) {
            $table->id();
            $table->string('recipient');
            $table->string('template_key')->nullable();
            $table->string('subject')->nullable();
            $table->string('status', 20)->default('queued'); // queued, sent, failed
            $table->string('provider', 50)->nullable();
            $table->string('from_address')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('recipient');
            $table->index('template_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_logs');
    }
};
