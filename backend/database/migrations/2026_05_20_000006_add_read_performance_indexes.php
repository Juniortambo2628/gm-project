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
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->index('type');
            $table->index('is_active');
        });

        Schema::table('faqs', function (Blueprint $table) {
            $table->index('category');
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->index('is_featured');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->index('status');
            $table->index('published_at');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index('is_read');
            $table->index('created_at');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->index('status');
            $table->index('email');
            $table->index('created_at');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'is_read']);
            $table->index('created_at');
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->index('group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropIndex(['is_active']);
        });

        Schema::table('faqs', function (Blueprint $table) {
            $table->dropIndex(['category']);
        });

        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropIndex(['is_featured']);
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['published_at']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['is_read']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['email']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'is_read']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->dropIndex(['group']);
        });
    }
};
