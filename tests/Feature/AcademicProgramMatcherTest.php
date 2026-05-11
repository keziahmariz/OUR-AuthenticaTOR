<?php

use App\Models\AcademicProgram;
use App\Services\AcademicProgramMatcher;

test('it matches OCR degrees that include parenthetical aliases', function () {
    AcademicProgram::factory()->create([
        'degree' => 'Master of Science in Biology',
        'specialization' => null,
        'normalized_degree' => AcademicProgram::normalizeDegree('Master of Science in Biology'),
    ]);

    $match = app(AcademicProgramMatcher::class)->match('MASTER OF SCIENCE IN BIOLOGY (MSBio)');

    expect($match)
        ->matched->toBeTrue()
        ->program->degree->toBe('Master of Science in Biology');
});

test('it matches configured programs that include parenthetical aliases', function () {
    AcademicProgram::factory()->create([
        'degree' => 'Master of Science in Biology (MSBio)',
        'specialization' => null,
        'normalized_degree' => AcademicProgram::normalizeDegree('Master of Science in Biology (MSBio)'),
    ]);

    $match = app(AcademicProgramMatcher::class)->match('Master of Science in Biology');

    expect($match)
        ->matched->toBeTrue()
        ->program->degree->toBe('Master of Science in Biology (MSBio)');
});
