<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class TorAnalysisService
{
    private const ModelLabels = [
        'efficientnet_b0_topk' => 'EfficientNet-B0 top-k aggregation',
    ];

    public function __construct(private AcademicProgramMatcher $academicProgramMatcher) {}

    /**
     * Analyze an uploaded TOR image.
     *
     * @return array{
     *     external_id: string,
     *     django_job_id: int|null,
     *     model_key: string,
     *     model_label: string,
     *     forgery_confidence: float,
     *     authenticity_score: float,
     *     verdict: string,
     *     detected_indicators: list<string>,
     *     gradcam_attention_map_url: string|null,
     *     model_result: array<string, mixed>,
     *     preprocessing: array<string, mixed>,
     *     error: string|null
     * }
     */
    /**
     * @param  array<string, string>  $expectedSignatures
     */
    public function analyze(string $storedPath, array $expectedSignatures = [], string $modelKey = 'efficientnet_b0_topk'): array
    {
        $externalId = (string) Str::uuid();
        $payload = $this->sendToModelService($storedPath, $externalId, $expectedSignatures, $modelKey);

        return $this->mapResponse($payload, $externalId);
    }

    /**
     * @param  array<string, string>  $expectedSignatures
     * @return array<string, mixed>
     */
    private function sendToModelService(string $storedPath, string $externalId, array $expectedSignatures, string $modelKey): array
    {
        $path = Storage::path($storedPath);
        $stream = fopen($path, 'r');

        if ($stream === false) {
            throw new RuntimeException(__('The uploaded TOR could not be read for analysis.'));
        }

        try {
            $response = Http::timeout((int) config('services.tor_model.timeout'))
                ->withHeaders([
                    'X-TOR-Service-Token' => (string) config('services.tor_model.token'),
                ])
                ->attach('image', $stream, basename($path))
                ->post($this->modelEndpoint(), [
                    'external_id' => $externalId,
                    'callback_url' => '',
                    'model_key' => $modelKey,
                    'expected_signatures' => json_encode($expectedSignatures, JSON_THROW_ON_ERROR),
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException(__('The TOR model service could not be reached. Please try again later.'), previous: $exception);
        } finally {
            fclose($stream);
        }

        if (! $response->successful()) {
            $message = $response->json('error')
                ?: sprintf(
                    'The TOR model service rejected the uploaded image. HTTP %d: %s',
                    $response->status(),
                    Str::limit(strip_tags($response->body()), 240),
                );

            throw new RuntimeException((string) $message);
        }

        try {
            /** @var array<string, mixed> $payload */
            $payload = $response->throw()->json();
        } catch (RequestException $exception) {
            throw new RuntimeException(__('The TOR model service returned an invalid response.'), previous: $exception);
        }

        return $payload;
    }

    private function modelEndpoint(): string
    {
        return rtrim((string) config('services.tor_model.url'), '/') . '/api/images/';
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{
     *     external_id: string,
     *     django_job_id: int|null,
     *     model_key: string,
     *     model_label: string,
     *     forgery_confidence: float,
     *     authenticity_score: float,
     *     verdict: string,
     *     detected_indicators: list<string>,
     *     gradcam_attention_map_url: string|null,
     *     model_result: array<string, mixed>,
     *     preprocessing: array<string, mixed>,
     *     error: string|null
     * }
     */
    private function mapResponse(array $payload, string $externalId): array
    {
        $result = $this->arrayValue($payload, 'result');
        $error = $this->stringValue($payload, 'error') ?: $this->stringValue($result, 'error');
        $status = $this->stringValue($payload, 'status');

        if ($status !== 'complete' || $this->boolValue($result, 'success') !== true) {
            throw new RuntimeException($error ?: __('The TOR model service could not complete the analysis.'));
        }

        $score = $this->floatValue($result, 'score');
        $forgeryConfidence = round($score * 100, 2);
        $authenticityScore = round(100 - $forgeryConfidence, 2);
        $label = $this->stringValue($result, 'label');
        $result = $this->withProgramMatch($result);
        $preprocessing = [
            'method' => $this->stringValue($payload, 'method'),
            'skew_status' => $this->stringValue($payload, 'skew_status'),
            'patch_counts' => $this->arrayValue($payload, 'patch_counts'),
        ];

        $modelKey = $this->stringValue($payload, 'model_key') ?: $this->stringValue($result, 'model_key') ?: 'efficientnet_b0_topk';
        $modelLabel = $this->stringValue($payload, 'model_label')
            ?: $this->stringValue($result, 'model_label')
            ?: (self::ModelLabels[$modelKey] ?? self::ModelLabels['efficientnet_b0_topk']);

        return [
            'external_id' => $externalId,
            'django_job_id' => $this->intValue($payload, 'job_id'),
            'model_key' => $modelKey,
            'model_label' => $modelLabel,
            'forgery_confidence' => $forgeryConfidence,
            'authenticity_score' => $authenticityScore,
            'verdict' => $label === 'fake' ? 'Suspicious' : 'Likely Authentic',
            'detected_indicators' => $this->detectedIndicators($result, $preprocessing),
            'gradcam_attention_map_url' => $this->stringValue($payload, 'preprocessed_image_url') ?: null,
            'model_result' => $result,
            'preprocessing' => $preprocessing,
            'error' => null,
        ];
    }

    /**
     * @param  array<string, mixed>  $result
     * @return array<string, mixed>
     */
    private function withProgramMatch(array $result): array
    {
        $degreeExtraction = $this->arrayValue($result, 'degree_extraction');

        if ($degreeExtraction === []) {
            $degreeExtraction = $this->arrayValue($result, 'ocr');
        }

        if ($degreeExtraction === []) {
            return $result;
        }

        $degree = $this->stringValue($degreeExtraction, 'degree')
            ?: $this->stringValue($degreeExtraction, 'course')
            ?: $this->stringValue($degreeExtraction, 'title');

        $degreeExtraction['program_match'] = $this->academicProgramMatcher->match($degree);
        $result['degree_extraction'] = $degreeExtraction;

        return $result;
    }

    /**
     * @param  array<string, mixed>  $result
     * @param  array<string, mixed>  $preprocessing
     * @return list<string>
     */
    private function detectedIndicators(array $result, array $preprocessing): array
    {
        $roiScores = $this->arrayValue($result, 'roi_scores');
        $patchCounts = $this->arrayValue($preprocessing, 'patch_counts');
        $documentSuspiciousness = $this->floatValue($result, 'score') * 100;
        $authenticitySupport = 100 - $documentSuspiciousness;

        return array_values(array_filter([
            sprintf('Document suspiciousness: %.1f%%', $documentSuspiciousness),
            sprintf('Authenticity support: %.1f%%', $authenticitySupport),
            $this->stringValue($result, 'top_roi') !== ''
                ? sprintf('Most suspicious region: %s', Str::headline($this->stringValue($result, 'top_roi')))
                : null,
            $roiScores !== []
                ? 'ROI top5 means: ' . $this->formatPercentMap($roiScores)
                : null,
            $this->stringValue($preprocessing, 'method') !== ''
                ? sprintf('Preprocessing method: %s', $this->stringValue($preprocessing, 'method'))
                : null,
            $this->stringValue($preprocessing, 'skew_status') !== ''
                ? sprintf('Skew status: %s', $this->stringValue($preprocessing, 'skew_status'))
                : null,
            $patchCounts !== []
                ? 'Patch counts: ' . $this->formatCountMap($patchCounts)
                : null,
        ]));
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function formatPercentMap(array $values): string
    {
        return collect($values)
            ->map(fn(mixed $value, string $key): string => sprintf('%s %.1f%%', Str::headline($key), $this->roiScoreValue($value) * 100))
            ->implode(', ');
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function formatCountMap(array $values): string
    {
        return collect($values)
            ->map(fn(mixed $value, string $key): string => sprintf('%s %d', Str::headline($key), (int) $this->numericValue($value)))
            ->implode(', ');
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private function arrayValue(array $values, string $key): array
    {
        $value = $values[$key] ?? [];

        return is_array($value) ? $value : [];
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function boolValue(array $values, string $key): bool
    {
        return ($values[$key] ?? false) === true;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function floatValue(array $values, string $key): float
    {
        return $this->numericValue($values[$key] ?? 0);
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function intValue(array $values, string $key): ?int
    {
        $value = $values[$key] ?? null;

        return is_numeric($value) ? (int) $value : null;
    }

    private function numericValue(mixed $value): float
    {
        return is_numeric($value) ? (float) $value : 0.0;
    }

    private function roiScoreValue(mixed $value): float
    {
        if (! is_array($value)) {
            return $this->numericValue($value);
        }

        if (array_key_exists('top5_mean', $value)) {
            return $this->numericValue($value['top5_mean']);
        }

        foreach ($value as $key => $score) {
            if (is_string($key) && preg_match('/^top\d+_mean$/', $key) === 1) {
                return $this->numericValue($score);
            }
        }

        foreach (['mean', 'max'] as $key) {
            if (array_key_exists($key, $value)) {
                return $this->numericValue($value[$key]);
            }
        }

        return 0.0;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function stringValue(array $values, string $key): string
    {
        $value = $values[$key] ?? '';

        return is_string($value) ? $value : '';
    }
}
