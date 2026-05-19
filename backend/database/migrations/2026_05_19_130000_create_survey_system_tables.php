<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Organizations
        if (!Schema::hasTable('organizations')) {
            Schema::create('organizations', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('industry')->nullable();
                $table->timestamps();
            });
        }

        // 2. Factors
        if (!Schema::hasTable('factors')) {
            Schema::create('factors', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }

        // 3. Polls
        if (!Schema::hasTable('polls')) {
            Schema::create('polls', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('status')->default('draft'); // draft, active, closed
                $table->unsignedBigInteger('organization_id')->index();
                $table->integer('year');
                $table->integer('quarter');
                $table->boolean('can_update_responses')->default(false);
                $table->timestamps();
            });
        }

        // 4. Questions
        if (!Schema::hasTable('questions')) {
            Schema::create('questions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('poll_id')->index();
                $table->unsignedBigInteger('factor_id')->index();
                $table->text('text');
                $table->decimal('weight', 8, 2)->default(1.00);
                $table->timestamps();
            });
        }

        // 5. Responses
        if (!Schema::hasTable('responses')) {
            Schema::create('responses', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->index();
                $table->unsignedBigInteger('poll_id')->index();
                $table->json('answers');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('responses');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('polls');
        Schema::dropIfExists('factors');
        Schema::dropIfExists('organizations');
    }
};
