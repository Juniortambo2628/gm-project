<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Clients now pick a Calendly slot before paying. The Calendly invitee URI is
 * the shared key that ties the slot (appointment) to the payment (transaction).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('calendly_invitee_uri')->nullable()->after('stripe_checkout_session_id')->index();
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->string('calendly_invitee_uri')->nullable()->after('transaction_id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['calendly_invitee_uri']);
            $table->dropColumn('calendly_invitee_uri');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['calendly_invitee_uri']);
            $table->dropColumn('calendly_invitee_uri');
        });
    }
};
