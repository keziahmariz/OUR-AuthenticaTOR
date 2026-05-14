<?php

namespace App\Models;

use Database\Factories\TorAnalysisProgramMatchFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'academic_program_id',
    'extracted_degree',
    'normalized_degree',
    'matched',
    'score',
    'program_snapshot',
    'raw_match',
])]
class TorAnalysisProgramMatch extends Model
{
    /** @use HasFactory<TorAnalysisProgramMatchFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'matched' => 'boolean',
            'score' => 'float',
            'program_snapshot' => 'array',
            'raw_match' => 'array',
        ];
    }

    /**
     * Get the analysis result that owns the program match.
     *
     * @return BelongsTo<TorAnalysisResult, $this>
     */
    public function torAnalysisResult(): BelongsTo
    {
        return $this->belongsTo(TorAnalysisResult::class);
    }

    /**
     * Get the academic program matched by the analysis.
     *
     * @return BelongsTo<AcademicProgram, $this>
     */
    public function academicProgram(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class);
    }
}
