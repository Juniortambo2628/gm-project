<?php

namespace Database\Seeders;

use App\Models\MailTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MailTemplateSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        foreach (MailTemplate::defaultTemplates() as $template) {
            MailTemplate::updateOrCreate(
                ['key' => $template['key']],
                $template
            );
        }
    }
}
