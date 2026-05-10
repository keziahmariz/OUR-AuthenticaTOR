<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadTorAnalysisRequest;
use App\Models\TorAnalysisResult;
use App\Services\TorAnalysisService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use RuntimeException;

class UploadTorController extends Controller
{
    /**
     * Show the TOR upload and analysis workflow.
     */
    public function __invoke(Request $request): InertiaResponse
    {
        $latestAnalysis = TorAnalysisResult::query()
            ->whereBelongsTo($request->user())
            ->latest()
            ->first();

        return Inertia::render('upload-tor', [
            'latestAnalysis' => $latestAnalysis === null
                ? null
                : $this->presentAnalysis($latestAnalysis),
        ]);
    }

    /**
     * Store a TOR temporarily and run the analysis service.
     */
    public function analyze(
        UploadTorAnalysisRequest $request,
        TorAnalysisService $torAnalysisService
    ): RedirectResponse {
        $storedPath = $request->file('tor_file')->store('tor-analysis/tmp');

        try {
            try {
                $analysis = $torAnalysisService->analyze($storedPath);
            } catch (RuntimeException $exception) {
                throw ValidationException::withMessages([
                    'tor_file' => $exception->getMessage(),
                ]);
            }

            TorAnalysisResult::query()->create([
                'user_id' => $request->user()->id,
                ...$analysis,
            ]);
        } finally {
            Storage::delete($storedPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('TOR analysis completed.')]);

        return to_route('uploadTor');
    }

    /**
     * Proxy a private Django preprocessed image for the authenticated owner.
     */
    public function preprocessedImage(Request $request, TorAnalysisResult $torAnalysisResult): HttpResponse
    {
        abort_unless($torAnalysisResult->user_id === $request->user()->id, 404);
        abort_if($torAnalysisResult->gradcam_attention_map_url === null, 404);

        return $this->proxyModelImage($torAnalysisResult->gradcam_attention_map_url);
    }

    /**
     * Proxy a private Django signature artifact for the authenticated owner.
     */
    public function signatureArtifact(Request $request, TorAnalysisResult $torAnalysisResult): HttpResponse
    {
        abort_unless($torAnalysisResult->user_id === $request->user()->id, 404);

        $url = $request->query('url');
        abort_unless(is_string($url) && $this->isAllowedSignatureArtifactUrl($torAnalysisResult, $url), 404);

        return $this->proxyModelImage($url);
    }

    /**
     * @return array<string, mixed>
     */
    private function presentAnalysis(TorAnalysisResult $analysis): array
    {
        return [
            ...$analysis->toArray(),
            'preprocessed_image_url' => $analysis->gradcam_attention_map_url === null
                ? null
                : route('uploadTor.preprocessedImage', $analysis),
            'signature_verification' => $this->signatureVerificationFor($analysis),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function signatureVerificationFor(TorAnalysisResult $analysis): ?array
    {
        $modelResult = $analysis->model_result;
        $signatureVerification = is_array($modelResult)
            ? ($modelResult['signature_verification'] ?? null)
            : null;

        if (! is_array($signatureVerification)) {
            return null;
        }

        $signatures = $signatureVerification['signatures'] ?? [];

        if (is_array($signatures)) {
            $signatureVerification['signatures'] = collect($signatures)
                ->filter(fn (mixed $signature): bool => is_array($signature))
                ->map(fn (array $signature): array => $this->proxySignatureArtifactUrls($analysis, $signature))
                ->values()
                ->all();
        }

        return $signatureVerification;
    }

    /**
     * @param  array<string, mixed>  $signature
     * @return array<string, mixed>
     */
    private function proxySignatureArtifactUrls(TorAnalysisResult $analysis, array $signature): array
    {
        foreach (['band_crop_url', 'ink_mask_url', 'debug_image_url'] as $key) {
            $url = $signature[$key] ?? null;

            if (is_string($url) && $url !== '') {
                $signature[$key] = route('uploadTor.signatureArtifact', [
                    'torAnalysisResult' => $analysis,
                    'url' => $url,
                ]);
            }
        }

        return $signature;
    }

    private function isAllowedSignatureArtifactUrl(TorAnalysisResult $analysis, string $url): bool
    {
        $modelResult = $analysis->model_result;
        $signatureVerification = is_array($modelResult)
            ? ($modelResult['signature_verification'] ?? null)
            : null;
        $signatures = is_array($signatureVerification)
            ? ($signatureVerification['signatures'] ?? [])
            : [];

        if (! is_array($signatures)) {
            return false;
        }

        $allowedUrls = collect($signatures)
            ->filter(fn (mixed $signature): bool => is_array($signature))
            ->flatMap(fn (array $signature): array => array_filter([
                $signature['band_crop_url'] ?? null,
                $signature['ink_mask_url'] ?? null,
                $signature['debug_image_url'] ?? null,
            ], is_string(...)))
            ->values();

        return $allowedUrls->contains($url);
    }

    private function proxyModelImage(string $url): HttpResponse
    {
        try {
            $response = Http::timeout((int) config('services.tor_model.timeout'))
                ->get($url);
        } catch (ConnectionException) {
            abort(404);
        }

        abort_unless($response->successful(), 404);

        return response($response->body(), 200)
            ->header('Content-Type', $response->header('Content-Type') ?: 'image/jpeg')
            ->header('Cache-Control', 'private, max-age=300');
    }
}
