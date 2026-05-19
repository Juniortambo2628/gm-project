<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Organization;
use App\Models\Factor;
use App\Models\Poll;
use App\Models\Question;

class SurveySeeder extends Seeder
{
    /**
     * Run the database seeds to initialize the coaching profile assessment survey (ID: 1).
     */
    public function run(): void
    {
        // 1. Create a core consulting organization
        $org = Organization::create([
            'id' => 1,
            'name' => 'Gathoni Mwai Executive Consulting',
            'industry' => 'Professional Development & Coaching'
        ]);

        // 2. Create coaching evaluation factors
        $factors = [
            'Admissions' => Factor::create(['id' => 1, 'name' => 'MBA Admissions & Profiles']),
            'Agility' => Factor::create(['id' => 2, 'name' => 'Case Interview & Business Agility']),
            'Execution' => Factor::create(['id' => 3, 'name' => 'Leadership Execution & Strategy']),
            'Trust' => Factor::create(['id' => 4, 'name' => 'Executive Trust & Presence']),
        ];

        // 3. Create the active poll (ID: 1)
        $poll = Poll::create([
            'id' => 1,
            'title' => 'Executive Profile & Leadership Capability Assessment',
            'description' => 'Calibrate your credentials narrative, case solving agility, strategic alignment, and interview execution under top-tier standards.',
            'status' => 'active',
            'organization_id' => $org->id,
            'year' => 2026,
            'quarter' => 2,
            'can_update_responses' => true
        ]);

        // 4. Create evaluation questions
        $questions = [
            [
                'poll_id' => $poll->id,
                'factor_id' => $factors['Admissions']->id,
                'text' => 'How confident are you in articulating your professional achievements and personal narrative to elite global business schools or advisory firms?',
                'weight' => 1.0
            ],
            [
                'poll_id' => $poll->id,
                'factor_id' => $factors['Agility']->id,
                'text' => 'How effectively can you break down unstructured business problems and structure high-impact recommendations under intense time constraints?',
                'weight' => 1.0
            ],
            [
                'poll_id' => $poll->id,
                'factor_id' => $factors['Execution']->id,
                'text' => 'How strongly do you communicate key strategic metrics and executable plans when presenting your professional project portfolios?',
                'weight' => 1.0
            ],
            [
                'poll_id' => $poll->id,
                'factor_id' => $factors['Trust']->id,
                'text' => 'How comfortable are you in maintaining exceptional executive presence, vocal control, and trust factors in high-stakes interview panels?',
                'weight' => 1.0
            ]
        ];

        foreach ($questions as $q) {
            Question::create($q);
        }
    }
}
