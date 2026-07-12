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
        // Legacy survey / Culture Monitor tables
        foreach (['responses', 'questions', 'polls', 'factors', 'organizations', 'profiles', 'standard_questions'] as $table) {
            Schema::dropIfExists($table);
        }

        // Legacy user columns
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'organization_id')) {
                $table->dropColumn('organization_id');
            }

            if (Schema::hasColumn('users', 'is_provisioned')) {
                $table->dropColumn('is_provisioned');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * Recreates the minimal structure from the original survey-system migration
     * and the legacy is_provisioned column so the change is reversible.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_provisioned')) {
                $table->boolean('is_provisioned')->default(false)->after('role');
            }
        });

        if (!Schema::hasTable('organizations')) {
            Schema::create('organizations', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('industry')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('factors')) {
            Schema::create('factors', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }

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
};
