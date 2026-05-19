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
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('industry')->nullable();
            $table->timestamps();
        });

        // 2. Factors
        Schema::create('factors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // 3. Polls
        Schema::create('polls', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('draft'); // draft, active, closed
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->integer('year');
            $table->integer('quarter');
            $table->boolean('can_update_responses')->default(false);
            $table->timestamps();
        });

        // 4. Questions
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poll_id')->constrained()->onDelete('cascade');
            $table->foreignId('factor_id')->constrained()->onDelete('cascade');
            $table->text('text');
            $table->decimal('weight', 8, 2)->default(1.00);
            $table->timestamps();
        });

        // 5. Responses
        Schema::create('responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('poll_id')->constrained()->onDelete('cascade');
            $table->json('answers');
            $table->timestamps();
        });
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
