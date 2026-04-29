<?php

namespace Database\Factories;

use App\Models\WelcomePageContent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WelcomePageContent>
 */
class WelcomePageContentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content' => WelcomePageContent::defaultContent(),
            'logo_image_path' => null,
            'hero_background_image_path' => null,
            'tor_preview_image_path' => null,
            'updated_by' => null,
        ];
    }
}
