<?php

namespace App\Models;

use Database\Factories\AcademicProgramFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable([
    'campus',
    'college',
    'program_level',
    'degree',
    'specialization',
    'normalized_degree',
    'is_active',
])]
class AcademicProgram extends Model
{
    /** @use HasFactory<AcademicProgramFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public static function normalizeDegree(string $degree): string
    {
        return Str::of($degree)
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/', ' ')
            ->squish()
            ->toString();
    }

    public function displayName(): string
    {
        if ($this->specialization === null || $this->specialization === '') {
            return $this->degree;
        }

        return "{$this->degree} major in {$this->specialization}";
    }
}
