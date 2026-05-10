<?php

namespace Database\Seeders;

use App\Models\AcademicProgram;
use Illuminate\Database\Seeder;

class AcademicProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = database_path('seeders/data/usep_academic_programs.csv');
        $handle = fopen($path, 'r');

        if ($handle === false) {
            return;
        }

        $headers = fgetcsv($handle);

        if ($headers === false) {
            fclose($handle);

            return;
        }

        while (($row = fgetcsv($handle)) !== false) {
            $record = array_combine($headers, $row);

            if ($record === false) {
                continue;
            }

            $degree = trim((string) $record['Degree']);
            $specialization = trim((string) $record['Specialization/Major']);

            AcademicProgram::query()->updateOrCreate(
                [
                    'campus' => trim((string) $record['Campus']),
                    'college' => trim((string) $record['College']),
                    'program_level' => trim((string) $record['Program Level']),
                    'degree' => $degree,
                    'specialization' => $specialization !== '' ? $specialization : null,
                ],
                [
                    'normalized_degree' => AcademicProgram::normalizeDegree($degree),
                    'is_active' => true,
                ],
            );
        }

        fclose($handle);
    }
}
