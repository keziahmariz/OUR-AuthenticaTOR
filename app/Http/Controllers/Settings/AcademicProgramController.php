<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AcademicProgramSaveRequest;
use App\Models\AcademicProgram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademicProgramController extends Controller
{
    public function edit(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        return Inertia::render('settings/academic-programs', [
            'programs' => AcademicProgram::query()
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                    $query
                        ->where('campus', 'like', "%{$search}%")
                        ->orWhere('college', 'like', "%{$search}%")
                        ->orWhere('degree', 'like', "%{$search}%")
                        ->orWhere('specialization', 'like', "%{$search}%");
                }))
                ->orderBy('campus')
                ->orderBy('college')
                ->orderBy('degree')
                ->orderBy('specialization')
                ->limit(300)
                ->get()
                ->map(fn (AcademicProgram $program): array => $this->presentProgram($program))
                ->all(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(AcademicProgramSaveRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $degree = (string) $validated['degree'];

        AcademicProgram::query()->create([
            ...$validated,
            'specialization' => $validated['specialization'] ?? null,
            'normalized_degree' => AcademicProgram::normalizeDegree($degree),
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Academic program created.')]);

        return to_route('academic-programs.edit');
    }

    public function update(AcademicProgramSaveRequest $request, AcademicProgram $academicProgram): RedirectResponse
    {
        $validated = $request->validated();
        $degree = (string) $validated['degree'];

        $academicProgram->update([
            ...$validated,
            'specialization' => $validated['specialization'] ?? null,
            'normalized_degree' => AcademicProgram::normalizeDegree($degree),
            'is_active' => (bool) ($validated['is_active'] ?? false),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Academic program updated.')]);

        return to_route('academic-programs.edit');
    }

    /**
     * @return array<string, mixed>
     */
    private function presentProgram(AcademicProgram $program): array
    {
        return [
            'id' => $program->id,
            'campus' => $program->campus,
            'college' => $program->college,
            'program_level' => $program->program_level,
            'degree' => $program->degree,
            'specialization' => $program->specialization,
            'display_name' => $program->displayName(),
            'is_active' => $program->is_active,
        ];
    }
}
