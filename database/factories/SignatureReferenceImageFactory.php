<?php

namespace Database\Factories;

use App\Models\SignaturePersonnel;
use App\Models\SignatureReferenceImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SignatureReferenceImage>
 */
class SignatureReferenceImageFactory extends Factory
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
            'path' => 'signature-references/'.fake()->uuid().'.png',
            'original_filename' => 'signature.png',
            'sync_status' => SignatureReferenceImage::SyncPending,
            'sync_error' => null,
            'synced_at' => null,
        ];
    }
}
