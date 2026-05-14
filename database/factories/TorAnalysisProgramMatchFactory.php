<?php

namespace Database\Factories;

use App\Models\TorAnalysisProgramMatch;
use App\Models\TorAnalysisResult;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TorAnalysisProgramMatch>
 */
class TorAnalysisProgramMatchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $degree = $this->faker->randomElement([
            'Bachelor of Science in Information Technology',
            'Master of Science in Biology',
        ]);

        return [
            'tor_analysis_result_id' => TorAnalysisResult::query()->create([
                'user_id' => User::factory()->create()->id,
                'external_id' => $this->faker->uuid(),
                'django_job_id' => $this->faker->numberBetween(1, 9999),
                'model_key' => 'efficientnet_b0_topk',
                'model_label' => 'EfficientNet-B0 top-k aggregation',
                'forgery_confidence' => $this->faker->randomFloat(6, 0, 100),
                'authenticity_score' => $this->faker->randomFloat(6, 0, 100),
                'verdict' => $this->faker->randomElement(['Suspicious', 'Likely Authentic']),
                'detected_indicators' => [],
                'preprocessed_image_url' => null,
                'model_result' => [],
                'preprocessing' => [],
            ])->id,
            'academic_program_id' => null,
            'extracted_degree' => $degree,
            'normalized_degree' => strtolower($degree),
            'matched' => false,
            'score' => 0.0,
            'program_snapshot' => null,
            'raw_match' => [
                'matched' => false,
                'normalized_degree' => strtolower($degree),
                'score' => 0.0,
                'program' => null,
            ],
        ];
    }
}
