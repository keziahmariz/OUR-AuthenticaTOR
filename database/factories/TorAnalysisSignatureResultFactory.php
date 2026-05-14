<?php

namespace Database\Factories;

use App\Models\TorAnalysisResult;
use App\Models\TorAnalysisSignatureResult;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TorAnalysisSignatureResult>
 */
class TorAnalysisSignatureResultFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
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
            'slot' => $this->faker->randomElement(['sig1_prepared_by', 'sig2_checked_by', 'sig3_certified_by']),
            'label' => $this->faker->words(2, true),
            'best_match_id' => $this->faker->slug(2),
            'best_match_name' => $this->faker->name(),
            'distance' => $this->faker->randomFloat(6, 0, 1),
            'score' => $this->faker->randomFloat(6, 0, 1),
            'verdict' => $this->faker->randomElement(['GENUINE', 'SUSPICIOUS', 'NEEDS MANUAL REVIEW']),
            'status' => null,
            'is_match' => $this->faker->boolean(),
            'signature_detected' => true,
            'model_inference_ran' => true,
            'ink_pixels' => $this->faker->numberBetween(1, 10000),
            'ink_ratio' => $this->faker->randomFloat(6, 0, 1),
            'max_component_area' => $this->faker->numberBetween(1, 10000),
            'signature_like_components' => $this->faker->numberBetween(1, 12),
            'bbox_xywh' => [1, 2, 3, 4],
            'band_crop_url' => null,
            'ink_mask_url' => null,
            'debug_image_url' => null,
            'message' => null,
            'error' => null,
            'raw_result' => [],
        ];
    }
}
