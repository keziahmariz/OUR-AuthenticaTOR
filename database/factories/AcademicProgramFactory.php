<?php

namespace Database\Factories;

use App\Models\AcademicProgram;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AcademicProgram>
 */
class AcademicProgramFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $degree = fake()->randomElement([
            'Bachelor of Science in Information Technology',
            'Bachelor of Science in Biology',
            'Master of Science in Applied Mathematics',
        ]);

        return [
            'campus' => 'Obrero Campus (Main)',
            'college' => fake()->randomElement(['College of Information and Computing', 'College of Arts and Sciences']),
            'program_level' => fake()->randomElement(['Undergraduate', 'Graduate']),
            'degree' => $degree,
            'specialization' => fake()->optional()->words(2, true),
            'normalized_degree' => AcademicProgram::normalizeDegree($degree),
            'is_active' => true,
        ];
    }
}
