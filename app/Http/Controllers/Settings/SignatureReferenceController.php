<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\SignatureReferenceUploadRequest;
use App\Models\SignaturePersonnel;
use App\Models\SignatureReferenceImage;
use App\Services\SignatureReferenceSyncService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class SignatureReferenceController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('settings/signatures', [
            'personnel' => SignaturePersonnel::query()
                ->with(['slots', 'referenceImages' => fn ($query) => $query->latest()->limit(6)])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn (SignaturePersonnel $person): array => [
                    'id' => $person->id,
                    'slug' => $person->slug,
                    'name' => $person->name,
                    'is_active' => $person->is_active,
                    'slots' => $person->slots->pluck('slot')->values()->all(),
                    'reference_images_count' => $person->referenceImages()->count(),
                    'latest_reference_images' => $person->referenceImages->map(fn (SignatureReferenceImage $image): array => [
                        'id' => $image->id,
                        'slot' => $image->slot,
                        'original_filename' => $image->original_filename,
                        'sync_status' => $image->sync_status,
                        'sync_error' => $image->sync_error,
                        'synced_at' => $image->synced_at?->toISOString(),
                    ])->all(),
                ])
                ->all(),
            'slots' => $this->slots(),
        ]);
    }

    public function update(Request $request, SignaturePersonnel $signaturePersonnel): RedirectResponse
    {
        abort_unless($request->user()?->can('manageSignatures'), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'is_active' => ['sometimes', 'boolean'],
            'slots' => ['required', 'array', 'min:1'],
            'slots.*' => ['required', 'string', 'in:'.implode(',', array_keys($this->slots()))],
        ]);

        DB::transaction(function () use ($signaturePersonnel, $validated): void {
            $signaturePersonnel->update([
                'name' => $validated['name'],
                'is_active' => (bool) ($validated['is_active'] ?? false),
            ]);

            $signaturePersonnel->slots()->delete();

            foreach (array_unique($validated['slots']) as $slot) {
                $signaturePersonnel->slots()->create(['slot' => $slot]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Signature personnel updated.')]);

        return to_route('signatures.edit');
    }

    public function store(
        SignatureReferenceUploadRequest $request,
        SignatureReferenceSyncService $syncService
    ): RedirectResponse {
        $personnel = SignaturePersonnel::query()->findOrFail($request->integer('signature_personnel_id'));
        $slot = (string) $request->validated('slot');
        $images = collect($request->file('images'))
            ->map(function ($file) use ($personnel, $slot): SignatureReferenceImage {
                return SignatureReferenceImage::query()->create([
                    'signature_personnel_id' => $personnel->id,
                    'slot' => $slot,
                    'path' => $file->store("signature-references/{$slot}/{$personnel->slug}"),
                    'original_filename' => $file->getClientOriginalName(),
                    'sync_status' => SignatureReferenceImage::SyncPending,
                ]);
            });

        try {
            $syncService->sync($personnel, $slot, $images);
            $images->each->update([
                'sync_status' => SignatureReferenceImage::SyncSucceeded,
                'sync_error' => null,
                'synced_at' => now(),
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Signature references uploaded and synced.')]);
        } catch (RuntimeException $exception) {
            $images->each->update([
                'sync_status' => SignatureReferenceImage::SyncFailed,
                'sync_error' => $exception->getMessage(),
            ]);

            Inertia::flash('toast', ['type' => 'error', 'message' => __('Signature references were uploaded, but model sync failed.')]);
        }

        return to_route('signatures.edit');
    }

    /**
     * @return array<string, string>
     */
    private function slots(): array
    {
        return [
            'sig1_prepared_by' => '1st Signatory - Prepared By',
            'sig2_checked_by' => '2nd Signatory - Checked By',
            'sig3_certified_by' => '3rd Signatory - Certified By',
        ];
    }
}
