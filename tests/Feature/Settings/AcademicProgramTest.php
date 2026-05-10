<?php

use App\Models\AcademicProgram;
use App\Models\User;
use Database\Seeders\AcademicProgramSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(AcademicProgramSeeder::class);
});

test('non admin users cannot access academic program settings', function () {
    $this->withoutVite();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('academic-programs.edit'))
        ->assertForbidden();
});

test('admin users can view seeded academic programs', function () {
    $this->withoutVite();

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('academic-programs.edit', ['search' => 'Information Technology']))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('settings/academic-programs')
                ->where('programs.0.degree', 'Bachelor of Science in Information Technology')
                ->where('filters.search', 'Information Technology'),
        );
});

test('admin users can create academic programs', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('academic-programs.store'), [
            'campus' => 'Tagum-Mabini Campus',
            'college' => 'College of Testing',
            'program_level' => 'Graduate',
            'degree' => 'Master of Science in Test Automation',
            'specialization' => 'Quality Engineering',
            'is_active' => '1',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('academic-programs.edit'));

    expect(AcademicProgram::query()
        ->where('degree', 'Master of Science in Test Automation')
        ->where('normalized_degree', 'master of science in test automation')
        ->exists())->toBeTrue();
});

test('admin users can deactivate academic programs', function () {
    $admin = User::factory()->admin()->create();
    $program = AcademicProgram::query()->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('academic-programs.update', $program), [
            'campus' => $program->campus,
            'college' => $program->college,
            'program_level' => $program->program_level,
            'degree' => $program->degree,
            'specialization' => $program->specialization,
            'is_active' => '0',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('academic-programs.edit'));

    expect($program->refresh()->is_active)->toBeFalse();
});
