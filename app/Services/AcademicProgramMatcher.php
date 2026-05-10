<?php

namespace App\Services;

use App\Models\AcademicProgram;

class AcademicProgramMatcher
{
    /**
     * @return array<string, mixed>|null
     */
    public function match(?string $degree): ?array
    {
        if ($degree === null || trim($degree) === '') {
            return null;
        }

        $normalizedDegree = AcademicProgram::normalizeDegree($degree);

        $program = AcademicProgram::query()
            ->where('is_active', true)
            ->where('normalized_degree', $normalizedDegree)
            ->orderBy('degree')
            ->orderBy('specialization')
            ->first();

        if ($program === null) {
            return [
                'matched' => false,
                'normalized_degree' => $normalizedDegree,
                'program' => null,
            ];
        }

        return [
            'matched' => true,
            'normalized_degree' => $normalizedDegree,
            'program' => [
                'id' => $program->id,
                'campus' => $program->campus,
                'college' => $program->college,
                'program_level' => $program->program_level,
                'degree' => $program->degree,
                'specialization' => $program->specialization,
                'display_name' => $program->displayName(),
            ],
        ];
    }
}
