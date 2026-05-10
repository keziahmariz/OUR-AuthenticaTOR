<?php

namespace App\Services;

use App\Models\SignaturePersonnel;
use App\Models\SignatureReferenceImage;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class SignatureReferenceSyncService
{
    /**
     * @param  iterable<SignatureReferenceImage>  $images
     */
    public function sync(SignaturePersonnel $personnel, string $slot, iterable $images): void
    {
        $request = Http::timeout((int) config('services.tor_model.timeout'))
            ->withHeaders([
                'X-TOR-Service-Token' => (string) config('services.tor_model.token'),
            ]);

        $streams = [];

        foreach ($images as $image) {
            $stream = fopen(Storage::disk('local')->path($image->path), 'r');

            if ($stream === false) {
                throw new RuntimeException(__('A signature reference image could not be read.'));
            }

            $streams[] = $stream;
            $request = $request->attach('images', $stream, $image->original_filename);
        }

        try {
            $response = $request->post($this->syncEndpoint(), [
                'slot' => $slot,
                'personnel_id' => $personnel->slug,
                'personnel_name' => $personnel->name,
            ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException(__('The TOR model service could not be reached for signature sync.'), previous: $exception);
        } finally {
            foreach ($streams as $stream) {
                fclose($stream);
            }
        }

        if (! $response->successful()) {
            throw new RuntimeException((string) ($response->json('error') ?: __('The TOR model service rejected the signature sync.')));
        }
    }

    private function syncEndpoint(): string
    {
        return rtrim((string) config('services.tor_model.url'), '/').'/api/signature-references/sync/';
    }
}
