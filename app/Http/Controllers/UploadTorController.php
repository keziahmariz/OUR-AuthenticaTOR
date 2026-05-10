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
                : [
                    ...$latestAnalysis->toArray(),
                    'preprocessed_image_url' => $latestAnalysis->gradcam_attention_map_url === null
                        ? null
                        : route('uploadTor.preprocessedImage', $latestAnalysis),
                ],
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

        try {
            $response = Http::timeout((int) config('services.tor_model.timeout'))
                ->get($torAnalysisResult->gradcam_attention_map_url);
        } catch (ConnectionException) {
            abort(404);
        }

        abort_unless($response->successful(), 404);

        return response($response->body(), 200)
            ->header('Content-Type', $response->header('Content-Type') ?: 'image/jpeg')
            ->header('Cache-Control', 'private, max-age=300');
    }
}
