<?php

namespace Database\Factories;

use App\Models\SignaturePersonnel;
use App\Models\SignaturePersonnelSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SignaturePersonnelSlot>
 */
class SignaturePersonnelSlotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'signature_personnel_id' => SignaturePersonnel::factory(),
            'slot' => fake()->randomElement(['sig1_prepared_by', 'sig2_checked_by', 'sig3_certified_by']),
        ];
    }
}
