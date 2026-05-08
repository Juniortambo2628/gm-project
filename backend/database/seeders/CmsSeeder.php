<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;
use App\Models\Service;

class CmsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. General Site Identity & Hero
        $this->seedSettings('hero', [
            'hero_tagline' => 'Oxford MBA. Former McKinsey. Helping Africans access the world\'s best opportunities.',
            'hero_headline' => 'Get into Oxford, LBS, or Cambridge. Land your consulting offer.',
            'hero_cta_mba' => 'MBA Admissions Coaching',
            'hero_cta_consulting' => 'Consulting Interview Prep',
            'hero_image' => '/portfolio-images/landing-hero-bg-image-landscape.png',
        ]);

        // 2. About Me Section
        $this->seedSettings('about', [
            'about_hey_gathoni' => 'Hey, I\'m Gathoni.',
            'about_tagline' => 'Helping Africans access the world\'s best opportunities by turning their authentic stories into admission-winning narratives.',
            'about_portrait' => '/about-professional-portrait-red-bg.png',
            'about_bio_narrative' => json_encode([
                "I'm a Kenyan professional currently completing my Masters in Business Administration (MBA) at Oxford's Saïd Business School. I am one of fewer than 10% of Africans in my cohort, and one of the even smaller number who got here on a full scholarship.",
                "Before Oxford, I spent five years in consulting across roughly 15 African countries, advising development finance institutions (DFIs), banks, and NGOs on some of the continent's toughest economic challenges.",
                "I've worked at McKinsey & Company's Nairobi office, risen to Senior Associate at Genesis Analytics, and worked at Rogers MacJohn, an impact-driven management consultancy.",
                "But here's the honest truth: none of that path was straightforward or obvious when I was where you are now. You're talented. You just need someone in your corner who actually gets it."
            ]),
        ]);

        // 3. Brand Logistics
        $this->seedSettings('branding', [
            'site_name' => 'Gathoni Mwai Coaching',
            'contact_email' => 'Gathoni.mwai0@gmail.com',
            'linkedin_url' => 'https://www.linkedin.com/in/gathoni-mwai-6747a8118/',
        ]);

        // 4. Services
        Service::updateOrCreate(['name' => 'MBA Admissions Coaching'], [
            'type' => 'mba',
            'duration' => '60 Min',
            'price' => 17,
            'currency' => 'USD',
            'is_active' => true,
            'features' => [
                'Competitive profile evaluation',
                'School shortlist & positioning',
                'CV / resume review',
                'Essay strategy & review',
                'Interview preparation',
                'Scholarship guidance'
            ],
            'description' => 'Personalized guidance from someone who got in, on a full scholarship.'
        ]);

        Service::updateOrCreate(['name' => 'Consulting Interview Prep'], [
            'type' => 'consulting',
            'duration' => '60 Min',
            'price' => 19,
            'currency' => 'USD',
            'is_active' => true,
            'features' => [
                'Mock case simulations',
                'PEI / Fit behavioral prep',
                'Structured feedback & scoring',
                'African market intelligence',
                'Improvement roadmap'
            ],
            'description' => 'Coached by a former McKinsey fellow and Genesis Analytics consultant.'
        ]);
    }

    private function seedSettings(string $group, array $data): void
    {
        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => $group, 'type' => 'string']
            );
        }
    }
}
