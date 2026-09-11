<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceDeduplicationSeeder extends Seeder
{
    /**
     * The only 3 services that should exist.
     */
    private array $allowedServices = [
        'MBA Application Coaching' => [
            'type' => 'mba',
            'duration' => '60 Min',
            'price' => 17,
            'currency' => 'GBP',
            'is_active' => true,
            'features' => [
                'Competitive profile evaluation',
                'School shortlist & positioning',
                'CV / resume review',
                'Essay strategy & review',
                'Interview preparation',
                'Scholarship guidance',
            ],
            'description' => 'Personalized guidance from someone who got in, on a full scholarship.',
        ],
        'Consulting Interview Prep' => [
            'type' => 'consulting',
            'duration' => '60 Min',
            'price' => 19,
            'currency' => 'GBP',
            'is_active' => true,
            'features' => [
                'Mock case simulations',
                'PEI / Fit behavioral prep',
                'Structured feedback & scoring',
                'African market intelligence',
                'Improvement roadmap',
            ],
            'description' => 'Coached by a former McKinsey fellow and Genesis Analytics consultant.',
        ],
        'Discovery Call' => [
            'type' => 'discovery',
            'duration' => '30 Min',
            'price' => 0,
            'currency' => 'GBP',
            'is_active' => true,
            'features' => [
                'Get to know your coaching options',
                'Ask any questions about MBA or consulting prep',
                'Personalized advice on next steps',
                'No commitment required',
            ],
            'description' => 'A free introductory call to explore how coaching can help you achieve your goals.',
        ],
    ];

    public function run(): void
    {
        $allowedNames = array_keys($this->allowedServices);

        // 1. Delete all services NOT in the allowed list
        $deleted = Service::whereNotIn('name', $allowedNames)->delete();
        $this->command?->info("Removed {$deleted} extra/duplicate service(s).");

        // 2. Upsert the 3 allowed services with correct data
        foreach ($this->allowedServices as $name => $data) {
            Service::updateOrCreate(['name' => $name], $data);
            $this->command?->info("Ensured service: {$name}");
        }

        // 3. Report final state
        $finalCount = Service::count();
        $this->command?->info("Total services in database: {$finalCount}");
    }
}
