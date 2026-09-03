<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('stripe_payment_intent_id')->nullable()->after('service_id');
            $table->string('stripe_checkout_session_id')->nullable()->after('stripe_payment_intent_id');
            $table->index('stripe_payment_intent_id');
            $table->index('stripe_checkout_session_id');
        });

        // Migrate existing paystack_ref data to stripe_payment_intent_id
        if (Schema::hasColumn('transactions', 'paystack_ref')) {
            DB::table('transactions')
                ->whereNotNull('paystack_ref')
                ->update(['stripe_payment_intent_id' => DB::raw('paystack_ref')]);

            Schema::table('transactions', function (Blueprint $table) {
                $table->dropColumn('paystack_ref');
            });
        }
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('paystack_ref')->nullable()->after('service_id');
        });

        DB::table('transactions')
            ->whereNotNull('stripe_payment_intent_id')
            ->update(['paystack_ref' => DB::raw('stripe_payment_intent_id')]);

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['stripe_payment_intent_id']);
            $table->dropIndex(['stripe_checkout_session_id']);
            $table->dropColumn('stripe_payment_intent_id');
            $table->dropColumn('stripe_checkout_session_id');
        });
    }
};
