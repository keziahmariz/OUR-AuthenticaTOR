<?php

namespace App\Models;

use Database\Factories\TorAnalysisSignatureResultFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'slot',
    'label',
    'best_match_id',
    'best_match_name',
    'distance',
    'score',
    'verdict',
    'status',
    'is_match',
    'signature_detected',
    'model_inference_ran',
    'ink_pixels',
    'ink_ratio',
    'max_component_area',
    'signature_like_components',
    'bbox_xywh',
    'band_crop_url',
    'ink_mask_url',
    'debug_image_url',
    'message',
    'error',
    'raw_result',
])]
class TorAnalysisSignatureResult extends Model
{
    /** @use HasFactory<TorAnalysisSignatureResultFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'distance' => 'float',
            'score' => 'float',
            'is_match' => 'boolean',
            'signature_detected' => 'boolean',
            'model_inference_ran' => 'boolean',
            'ink_ratio' => 'float',
            'bbox_xywh' => 'array',
            'raw_result' => 'array',
        ];
    }

    /**
     * Get the analysis result that owns the signature result.
     *
     * @return BelongsTo<TorAnalysisResult, $this>
     */
    public function torAnalysisResult(): BelongsTo
    {
        return $this->belongsTo(TorAnalysisResult::class);
    }
}
