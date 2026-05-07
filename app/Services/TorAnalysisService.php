<?php

namespace App\Services;

class TorAnalysisService
{
    /**
     * Analyze an uploaded TOR image.
     *
     * This deterministic stub keeps the controller contract stable until the
     * Python preprocessing/model pipeline is ready to be called here.
     *
     * @return array{
     *     forgery_confidence: float,
     *     authenticity_score: float,
     *     verdict: string,
     *     detected_indicators: list<string>,
     *     gradcam_attention_map_url: string|null
     * }
     */
    public function analyze(string $storedPath): array
    {
        return [
            'forgery_confidence' => 93.3,
            'authenticity_score' => 8.7,
            'verdict' => 'Likely Forged',
            'detected_indicators' => [
                'Inconsistent text alignment in registrar fields',
                'Irregular seal boundary attention detected',
                'Unusual texture variance near grade entries',
            ],
            'gradcam_attention_map_url' => null,
        ];
    }
}
