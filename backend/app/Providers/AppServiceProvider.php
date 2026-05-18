<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Schema::defaultStringLength(191);

        if (Schema::hasTable('settings')) {
            config([
                'mail.mailers.smtp.host' => \App\Models\Setting::get('mail_host', config('mail.mailers.smtp.host')),
                'mail.mailers.smtp.port' => \App\Models\Setting::get('mail_port', config('mail.mailers.smtp.port')),
                'mail.mailers.smtp.username' => \App\Models\Setting::get('mail_username', config('mail.mailers.smtp.username')),
                'mail.mailers.smtp.password' => \App\Models\Setting::get('mail_password', config('mail.mailers.smtp.password')),
                'mail.mailers.smtp.encryption' => \App\Models\Setting::get('mail_encryption', config('mail.mailers.smtp.encryption')),
                'mail.from.address' => \App\Models\Setting::get('mail_from_address', config('mail.from.address')),
                'mail.from.name' => \App\Models\Setting::get('mail_from_name', config('mail.from.name')),
            ]);
        }
    }
}
