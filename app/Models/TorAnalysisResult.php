<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id',
    'external_id',
    'django_job_id',
    'model_key',
    'model_label',
    'forgery_confidence',
    'authenticity_score',
    'verdict',
    'detected_indicators',
    'preprocessed_image_url',
    'model_result',
    'preprocessing',
    'error',
])]
class TorAnalysisResult extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'forgery_confidence' => 'float',
            'authenticity_score' => 'float',
            'detected_indicators' => 'array',
            'model_result' => 'array',
            'preprocessing' => 'array',
        ];
    }

    /**
     * Get the user that owns the TOR analysis result.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the normalized signature results for this analysis.
     *
     * @return HasMany<TorAnalysisSignatureResult, $this>
     */
    public function signatureResults(): HasMany
    {
        return $this->hasMany(TorAnalysisSignatureResult::class);
    }

    /**
     * Get the normalized academic program match for this analysis.
     *
     * @return HasOne<TorAnalysisProgramMatch, $this>
     */
    public function programMatch(): HasOne
    {
        return $this->hasOne(TorAnalysisProgramMatch::class);
    }
}
