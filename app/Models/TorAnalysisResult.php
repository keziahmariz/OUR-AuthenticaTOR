<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'forgery_confidence',
    'authenticity_score',
    'verdict',
    'detected_indicators',
    'gradcam_attention_map_url',
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
}
