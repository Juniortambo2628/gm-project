<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up(): void
    {
        $settings = [
            // General
            ['key' => 'site_name', 'value' => 'Gathoni Mwai Coaching', 'group' => 'general', 'type' => 'string'],
            ['key' => 'site_description', 'value' => 'MBA Admissions & Consulting Interview Coaching', 'group' => 'general', 'type' => 'string'],
            ['key' => 'support_email', 'value' => 'Gathoni.mwai0@gmail.com', 'group' => 'general', 'type' => 'string'],
            ['key' => 'paystack_public_key', 'value' => 'pk_test_59a0c67a06a28c643010d37bfd366057846410c2', 'group' => 'general', 'type' => 'string'],
            
            // Communications
            ['key' => 'enable_notifications', 'value' => 'true', 'group' => 'communications', 'type' => 'boolean'],
            ['key' => 'welcome_message', 'value' => 'Welcome to the Gathoni Mwai Coaching portal.', 'group' => 'communications', 'type' => 'string'],
            
            // Security
            ['key' => 'allow_public_registration', 'value' => 'true', 'group' => 'security', 'type' => 'boolean'],
            ['key' => 'session_timeout', 'value' => '120', 'group' => 'security', 'type' => 'number'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }

    public function run(): void
    {
        $this->up();
    }
}
