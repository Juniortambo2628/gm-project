<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // General Settings
        \App\Models\Setting::set('site_name', 'Gathoni Mwai Coaching');
        \App\Models\Setting::set('hero_tagline', 'Oxford MBA. Former McKinsey. Helping Africans access the world\'s best opportunities.');
        \App\Models\Setting::set('hero_headline', 'Get into Oxford, LBS, or Cambridge. Land your consulting offer.');
        \App\Models\Setting::set('hero_cta_mba', 'MBA Admissions Coaching');
        \App\Models\Setting::set('hero_cta_consulting', 'Consulting Interview Prep');
        \App\Models\Setting::set('about_bio_short', 'Oxford MBA. Former McKinsey. Helping Africans access the world\'s best opportunities.');
        \App\Models\Setting::set('about_bio_full', "Hey, I'm Gathoni.\n\nI'm a Kenyan professional currently completing my Masters in Business Administration (MBA) at Oxford's Saïd Business School. I am one of fewer than 10% of Africans in my cohort, and one of the even smaller number who got here on a full scholarship.\n\nBefore Oxford, I spent five years in consulting across roughly 15 African countries, advising development finance institutions (DFIs), banks, and NGOs on some of the continent's toughest economic challenges.\n\n\"But here's the honest truth: none of that path was straightforward or obvious when I was where you are now. You're talented. You just need someone in your corner who actually gets it.\"\n\nI've worked at McKinsey & Company's Nairobi office, risen to Senior Associate at Genesis Analytics, and worked at Rogers MacJohn, an impact-driven management consultancy.");
        \App\Models\Setting::set('about_tagline', "Your background isn't a disadvantage. Most coaches just don't know what to do with it.");
        \App\Models\Setting::set('african_coach_headline', 'African coach?');
        \App\Models\Setting::set('african_coach_description', "African students bring sharp analytical thinking, real-world experience in complex markets, and stories that no one from a Western university can replicate. The problem isn't your profile, it's knowing how to position it.");
        \App\Models\Setting::set('homepage_mba_desc', "Targeting Oxford, LBS, or Cambridge? I help you craft an authentic African narrative that resonates with the world's best admissions committees.");
        \App\Models\Setting::set('homepage_consulting_desc', "MBB case interviews require more than just logic; they require impact-driven confidence. Prep with a former McKinsey fellow who knows the African market.");
        \App\Models\Setting::set('mba_headline', 'Your African story is an asset.');
        \App\Models\Setting::set('mba_description', "But it has to be told right. I help you move beyond the tired narratives admissions readers have seen before and craft something authentic, specific, and compelling.");
        \App\Models\Setting::set('consulting_headline', 'Cracking the case is contextual.');
        \App\Models\Setting::set('consulting_description', "Generic prep platforms teach you logic. I teach you impact. I help African candidates leverage their unique market knowledge as a decisive advantage in the interview room.");
        \App\Models\Setting::set('credentials_json', '[
  {"icon": "GraduationCap", "title": "Oxford MBA", "subtitle": "Said Business School, Class of 2026", "desc": "One of fewer than 10% of Africans in the cohort."},
  {"icon": "Award", "title": "Laidlaw Scholar", "subtitle": "Full Tuition Scholarship", "desc": "Selected for 100% merit-based funding for the Oxford MBA."},
  {"icon": "Briefcase", "title": "McKinsey & Company", "subtitle": "Young Leaders Programme Fellow", "desc": "Nairobi-based fellowship identifying top African leadership talent."},
  {"icon": "TrendingUp", "title": "Genesis Analytics", "subtitle": "Senior Associate", "desc": "Africa\'s largest economics consulting firm."},
  {"icon": "Star", "title": "CFA Research Winner", "subtitle": "Kenya & East Africa", "desc": "Represented East Africa in the regional finals in Dublin, Ireland."},
  {"icon": "Globe", "title": "Africa Alliance Co-Director", "subtitle": "Said Business School", "desc": "Leading the East Africa Regionals for the Oxford Africa Business Forum."}
]');
        
        // Services
        \App\Models\Service::create([
            'name' => 'Discovery Call',
            'type' => 'mba',
            'duration' => '20 Min',
            'price' => 0,
            'features' => [
                'Profile assessment: your background, target schools, and gaps',
                'Q&A on the Oxford / LBS / Cambridge application process',
                'Scholarship overview: Laidlaw, Chevening, Rhodes, Commonwealth',
                'No obligation — just an honest, no-pressure conversation'
            ]
        ]);

        \App\Models\Service::create([
            'name' => 'MBA Application Coaching Session',
            'type' => 'mba',
            'duration' => '60 Min',
            'price' => 17,
            'features' => [
                '60-minute 1-on-1 coaching sessions',
                'Competitive profile evaluation: honest assessment of your strengths, gaps, and best-fit schools',
                'School shortlist and positioning strategy tailored to your African profile',
                'CV / resume review for MBA applications',
                'Essay / personal statement review',
                'Admissions interview preparation',
                'Scholarship application guidance'
            ]
        ]);

        \App\Models\Service::create([
            'name' => 'Single Mock Interview',
            'type' => 'consulting',
            'duration' => '60 Min',
            'price' => 19,
            'features' => [
                'Mock case interview simulation (McKinsey / BCG / Bain)',
                'Mock fit interview simulation (McKinsey / BCG / Bain)',
                'Structured feedback',
                'Questions on application strategy'
            ]
        ]);

        // FAQs
        \App\Models\Faq::create([
            'question' => 'I went to a university in Africa. Can I still get into LBS or Oxford?',
            'answer' => 'Absolutely! Top UK business schools actively seek diverse, international profiles. I did it from Strathmore University, and I can help you do it too.',
            'category' => 'mba',
            'order' => 1
        ]);
        
        \App\Models\Faq::create([
            'question' => 'Do you prepare clients for African consulting firms, or only global ones?',
            'answer' => 'Both. I have direct experience at McKinsey Nairobi and Genesis Analytics, Africa\'s largest economics consulting firm.',
            'category' => 'consulting',
            'order' => 1
        ]);
    }
}
