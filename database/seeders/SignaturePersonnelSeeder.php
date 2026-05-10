<?php

namespace Database\Seeders;

use App\Models\SignaturePersonnel;
use App\Models\SignaturePersonnelSlot;
use Illuminate\Database\Seeder;

class SignaturePersonnelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = database_path('seeders/data/signature_personnel.json');
        $personnelBySlot = json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        $sortOrder = 1;

        foreach ($personnelBySlot as $slot => $personnelRows) {
            foreach ($personnelRows as $row) {
                $personnel = SignaturePersonnel::query()->updateOrCreate(
                    ['slug' => $row['id']],
                    [
                        'name' => $row['name'],
                        'is_active' => true,
                        'sort_order' => $sortOrder++,
                    ],
                );

                SignaturePersonnelSlot::query()->firstOrCreate([
                    'signature_personnel_id' => $personnel->id,
                    'slot' => $slot,
                ]);
            }
        }
    }
}
