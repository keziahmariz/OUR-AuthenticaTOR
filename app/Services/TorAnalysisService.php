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
    /**
     * Analyze an uploaded TOR image.
     *
     * @return array{
     *     external_id: string,
     *     django_job_id: int|null,
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
    public function analyze(string $storedPath): array
    {
        $externalId = (string) Str::uuid();
        $payload = $this->sendToModelService($storedPath, $externalId);

        return $this->mapResponse($payload, $externalId);
    }

    /**
     * @return array<string, mixed>
     */
    private function sendToModelService(string $storedPath, string $externalId): array
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
        return rtrim((string) config('services.tor_model.url'), '/').'/api/images/';
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{
     *     external_id: string,
     *     django_job_id: int|null,
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
        $preprocessing = [
            'method' => $this->stringValue($payload, 'method'),
            'skew_status' => $this->stringValue($payload, 'skew_status'),
            'patch_counts' => $this->arrayValue($payload, 'patch_counts'),
        ];

        return [
            'external_id' => $externalId,
            'django_job_id' => $this->intValue($payload, 'job_id'),
            'forgery_confidence' => $forgeryConfidence,
            'authenticity_score' => $authenticityScore,
            'verdict' => $label === 'fake' ? 'Likely Forged' : 'Likely Authentic',
            'detected_indicators' => $this->detectedIndicators($result, $preprocessing),
            'gradcam_attention_map_url' => $this->stringValue($payload, 'preprocessed_image_url') ?: null,
            'model_result' => $result,
            'preprocessing' => $preprocessing,
            'error' => null,
        ];
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

        return array_values(array_filter([
            sprintf('Document forgery score: %.1f%%', $this->floatValue($result, 'score') * 100),
            $this->stringValue($result, 'top_roi') !== ''
                ? sprintf('Highest-scoring region: %s', Str::headline($this->stringValue($result, 'top_roi')))
                : null,
            $roiScores !== []
                ? 'ROI scores: '.$this->formatPercentMap($roiScores)
                : null,
            $this->stringValue($preprocessing, 'method') !== ''
                ? sprintf('Preprocessing method: %s', $this->stringValue($preprocessing, 'method'))
                : null,
            $this->stringValue($preprocessing, 'skew_status') !== ''
                ? sprintf('Skew status: %s', $this->stringValue($preprocessing, 'skew_status'))
                : null,
            $patchCounts !== []
                ? 'Patch counts: '.$this->formatCountMap($patchCounts)
                : null,
        ]));
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function formatPercentMap(array $values): string
    {
        return collect($values)
            ->map(fn (mixed $value, string $key): string => sprintf('%s %.1f%%', Str::headline($key), $this->numericValue($value) * 100))
            ->implode(', ');
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function formatCountMap(array $values): string
    {
        return collect($values)
            ->map(fn (mixed $value, string $key): string => sprintf('%s %d', Str::headline($key), (int) $this->numericValue($value)))
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

    /**
     * @param  array<string, mixed>  $values
     */
    private function stringValue(array $values, string $key): string
    {
        $value = $values[$key] ?? '';

        return is_string($value) ? $value : '';
    }
}
