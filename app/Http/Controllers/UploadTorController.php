<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadTorAnalysisRequest;
use App\Models\TorAnalysisResult;
use App\Services\TorAnalysisService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UploadTorController extends Controller
{
    /**
     * Show the TOR upload and analysis workflow.
     */
    public function __invoke(Request $request): Response
    {
        $latestAnalysis = TorAnalysisResult::query()
            ->whereBelongsTo($request->user())
            ->latest()
            ->first();

        return Inertia::render('upload-tor', [
            'latestAnalysis' => $latestAnalysis,
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
            $analysis = $torAnalysisService->analyze($storedPath);

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
}
