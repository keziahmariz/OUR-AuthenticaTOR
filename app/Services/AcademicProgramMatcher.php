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
        $normalizedCandidates = $this->normalizedDegreeCandidates($degree);

        $program = AcademicProgram::query()
            ->where('is_active', true)
            ->whereIn('normalized_degree', $normalizedCandidates)
            ->orderBy('degree')
            ->orderBy('specialization')
            ->first();

        $program ??= $this->matchCanonicalDegree($degree);

        if ($program === null) {
            return [
                'matched' => false,
                'normalized_degree' => $normalizedDegree,
                'score' => 0.0,
                'program' => null,
            ];
        }

        return [
            'matched' => true,
            'normalized_degree' => $normalizedDegree,
            'score' => 1.0,
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

    /**
     * @return list<string>
     */
    private function normalizedDegreeCandidates(string $degree): array
    {
        return collect([
            $degree,
            $this->withoutParentheticalAliases($degree),
        ])
            ->map(fn (string $candidate): string => AcademicProgram::normalizeDegree($candidate))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function matchCanonicalDegree(string $degree): ?AcademicProgram
    {
        $canonicalDegree = AcademicProgram::normalizeDegree($this->withoutParentheticalAliases($degree));

        return AcademicProgram::query()
            ->where('is_active', true)
            ->orderBy('degree')
            ->orderBy('specialization')
            ->get()
            ->first(fn (AcademicProgram $program): bool => AcademicProgram::normalizeDegree(
                $this->withoutParentheticalAliases($program->degree),
            ) === $canonicalDegree);
    }

    private function withoutParentheticalAliases(string $degree): string
    {
        return (string) preg_replace('/\s*\([^)]*\)/', ' ', $degree);
    }
}
