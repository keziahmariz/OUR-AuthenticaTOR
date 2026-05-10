<?php

use App\Models\TorAnalysisResult;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page from the upload tor page', function () {
    $this->get(route('uploadTor'))
        ->assertRedirect(route('login'));
});

test('authenticated users can visit the upload tor page', function () {
    $this->withoutVite();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('uploadTor'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('upload-tor')
                ->where('latestAnalysis', null),
        );
});

test('upload tor page exposes a laravel proxy url for the latest preprocessed image', function () {
    $this->withoutVite();

    $user = User::factory()->create();
    $analysis = TorAnalysisResult::query()->create([
        'user_id' => $user->id,
        'external_id' => fake()->uuid(),
        'django_job_id' => 11,
        'forgery_confidence' => 93.3,
        'authenticity_score' => 6.7,
        'verdict' => 'Likely Forged',
        'detected_indicators' => ['Document forgery score: 93.3%'],
        'gradcam_attention_map_url' => 'http://127.0.0.1:8001/media/preprocessed/tor.jpg',
        'model_result' => ['label' => 'fake', 'score' => 0.933],
        'preprocessing' => ['method' => 'brightness'],
    ]);

    $this->actingAs($user)
        ->get(route('uploadTor'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('upload-tor')
                ->where('latestAnalysis.id', $analysis->id)
                ->where('latestAnalysis.preprocessed_image_url', route('uploadTor.preprocessedImage', $analysis)),
        );
});

test('upload tor page exposes signature verification with proxied artifact urls', function () {
    $this->withoutVite();

    $user = User::factory()->create();
    $analysis = TorAnalysisResult::query()->create([
        'user_id' => $user->id,
        'external_id' => fake()->uuid(),
        'django_job_id' => 11,
        'forgery_confidence' => 93.3,
        'authenticity_score' => 6.7,
        'verdict' => 'Likely Forged',
        'detected_indicators' => ['Document forgery score: 93.3%'],
        'gradcam_attention_map_url' => 'http://127.0.0.1:8001/media/preprocessed/tor.jpg',
        'model_result' => [
            'label' => 'fake',
            'score' => 0.933,
            'signature_verification' => signatureVerificationPayload(),
        ],
        'preprocessing' => ['method' => 'brightness'],
    ]);

    $this->actingAs($user)
        ->get(route('uploadTor'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('upload-tor')
                ->where('latestAnalysis.id', $analysis->id)
                ->where('latestAnalysis.signature_verification.success', true)
                ->where('latestAnalysis.signature_verification.signatures.0.best_match_name', 'Judito T. Abadia')
                ->where(
                    'latestAnalysis.signature_verification.signatures.0.band_crop_url',
                    route('uploadTor.signatureArtifact', [
                        'torAnalysisResult' => $analysis,
                        'url' => 'http://127.0.0.1:8001/media/signatures/job/sig1_prepared_by_band.png',
                    ]),
                ),
        );
});

test('authenticated users can view their proxied preprocessed image', function () {
    Http::preventStrayRequests();
    Http::fake([
        'http://127.0.0.1:8001/media/preprocessed/tor.jpg' => Http::response('image-bytes', 200, [
            'Content-Type' => 'image/jpeg',
        ]),
    ]);

    $user = User::factory()->create();
    $analysis = TorAnalysisResult::query()->create([
        'user_id' => $user->id,
        'external_id' => fake()->uuid(),
        'django_job_id' => 11,
        'forgery_confidence' => 93.3,
        'authenticity_score' => 6.7,
        'verdict' => 'Likely Forged',
        'detected_indicators' => ['Document forgery score: 93.3%'],
        'gradcam_attention_map_url' => 'http://127.0.0.1:8001/media/preprocessed/tor.jpg',
        'model_result' => ['label' => 'fake', 'score' => 0.933],
        'preprocessing' => ['method' => 'brightness'],
    ]);

    $this->actingAs($user)
        ->get(route('uploadTor.preprocessedImage', $analysis))
        ->assertOk()
        ->assertHeader('Content-Type', 'image/jpeg')
        ->assertSee('image-bytes');
});

test('authenticated users cannot view another users preprocessed image', function () {
    Http::preventStrayRequests();

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $analysis = TorAnalysisResult::query()->create([
        'user_id' => $owner->id,
        'external_id' => fake()->uuid(),
        'django_job_id' => 11,
        'forgery_confidence' => 93.3,
        'authenticity_score' => 6.7,
        'verdict' => 'Likely Forged',
        'detected_indicators' => ['Document forgery score: 93.3%'],
        'gradcam_attention_map_url' => 'http://127.0.0.1:8001/media/preprocessed/tor.jpg',
        'model_result' => ['label' => 'fake', 'score' => 0.933],
        'preprocessing' => ['method' => 'brightness'],
    ]);

    $this->actingAs($otherUser)
        ->get(route('uploadTor.preprocessedImage', $analysis))
        ->assertNotFound();
});

test('authenticated users can view their proxied signature artifact', function () {
    Http::preventStrayRequests();
    Http::fake([
        'http://127.0.0.1:8001/media/signatures/job/sig1_prepared_by_band.png' => Http::response('signature-bytes', 200, [
            'Content-Type' => 'image/png',
        ]),
    ]);

    $user = User::factory()->create();
    $analysis = TorAnalysisResult::query()->create([
        'user_id' => $user->id,
        'external_id' => fake()->uuid(),
        'django_job_id' => 11,
        'forgery_confidence' => 93.3,
        'authenticity_score' => 6.7,
        'verdict' => 'Likely Forged',
        'detected_indicators' => ['Document forgery score: 93.3%'],
        'gradcam_attention_map_url' => null,
        'model_result' => [
            'signature_verification' => signatureVerificationPayload(),
        ],
        'preprocessing' => ['method' => 'brightness'],
    ]);

    $this->actingAs($user)
        ->get(route('uploadTor.signatureArtifact', [
            'torAnalysisResult' => $analysis,
            'url' => 'http://127.0.0.1:8001/media/signatures/job/sig1_prepared_by_band.png',
        ]))
        ->assertOk()
        ->assertHeader('Content-Type', 'image/png')
        ->assertSee('signature-bytes');
});

test('authenticated users cannot view unlisted signature artifact urls', function () {
    Http::preventStrayRequests();

    $user = User::factory()->create();
    $analysis = TorAnalysisResult::query()->create([
        'user_id' => $user->id,
        'external_id' => fake()->uuid(),
        'django_job_id' => 11,
        'forgery_confidence' => 93.3,
        'authenticity_score' => 6.7,
        'verdict' => 'Likely Forged',
        'detected_indicators' => ['Document forgery score: 93.3%'],
        'gradcam_attention_map_url' => null,
        'model_result' => [
            'signature_verification' => signatureVerificationPayload(),
        ],
        'preprocessing' => ['method' => 'brightness'],
    ]);

    $this->actingAs($user)
        ->get(route('uploadTor.signatureArtifact', [
            'torAnalysisResult' => $analysis,
            'url' => 'http://127.0.0.1:8001/media/signatures/job/not-listed.png',
        ]))
        ->assertNotFound();
});

test('authenticated users cannot view another users signature artifact', function () {
    Http::preventStrayRequests();

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $analysis = TorAnalysisResult::query()->create([
        'user_id' => $owner->id,
        'external_id' => fake()->uuid(),
        'django_job_id' => 11,
        'forgery_confidence' => 93.3,
        'authenticity_score' => 6.7,
        'verdict' => 'Likely Forged',
        'detected_indicators' => ['Document forgery score: 93.3%'],
        'gradcam_attention_map_url' => null,
        'model_result' => [
            'signature_verification' => signatureVerificationPayload(),
        ],
        'preprocessing' => ['method' => 'brightness'],
    ]);

    $this->actingAs($otherUser)
        ->get(route('uploadTor.signatureArtifact', [
            'torAnalysisResult' => $analysis,
            'url' => 'http://127.0.0.1:8001/media/signatures/job/sig1_prepared_by_band.png',
        ]))
        ->assertNotFound();
});

test('guests are redirected from the upload tor analysis endpoint', function () {
    $file = UploadedFile::fake()->image('tor.jpg');

    $this->post(route('uploadTor.analyze'), [
        'tor_file' => $file,
    ])->assertRedirect(route('login'));
});

test('authenticated users can analyze a valid tor image', function () {
    Storage::fake('local');
    Http::preventStrayRequests();
    Http::fake([
        'http://127.0.0.1:8001/api/images/' => Http::response([
            'id' => 11,
            'job_id' => 11,
            'external_id' => 'ignored-service-echo',
            'status' => 'complete',
            'preprocessed_image_url' => 'http://127.0.0.1:8001/media/preprocessed/tor.jpg',
            'method' => 'brightness',
            'skew_status' => 'flat',
            'patch_counts' => ['header' => 1, 'body' => 2, 'footer' => 3],
            'result' => [
                'success' => true,
                'label' => 'fake',
                'score' => 0.933,
                'roi_scores' => ['header' => 0.2, 'body' => 0.4, 'footer' => 0.933],
                'top_roi' => 'footer',
                'signature_verification' => signatureVerificationPayload(),
                'error' => '',
            ],
            'error' => '',
        ], 201),
    ]);
    config([
        'services.tor_model.token' => 'testing-token',
        'services.tor_model.url' => 'http://127.0.0.1:8001',
    ]);

    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('tor.jpg');

    $this->actingAs($user)
        ->post(route('uploadTor.analyze'), [
            'tor_file' => $file,
        ])
        ->assertRedirect(route('uploadTor'));

    expect(TorAnalysisResult::query()->whereBelongsTo($user)->count())->toBe(1);

    $analysis = TorAnalysisResult::query()->whereBelongsTo($user)->first();

    expect($analysis)
        ->external_id->not->toBeEmpty()
        ->django_job_id->toBe(11)
        ->forgery_confidence->toBe(93.3)
        ->authenticity_score->toBe(6.7)
        ->verdict->toBe('Likely Forged')
        ->detected_indicators->toHaveCount(6)
        ->gradcam_attention_map_url->toBe('http://127.0.0.1:8001/media/preprocessed/tor.jpg')
        ->model_result->toMatchArray(['label' => 'fake', 'score' => 0.933])
        ->preprocessing->toMatchArray(['method' => 'brightness', 'skew_status' => 'flat']);

    expect($analysis->model_result['signature_verification']['success'])->toBeTrue();

    expect(Storage::disk('local')->allFiles('tor-analysis/tmp'))->toBe([]);

    Http::assertSent(fn ($request): bool => $request->url() === 'http://127.0.0.1:8001/api/images/'
        && $request->hasHeader('X-TOR-Service-Token', 'testing-token'));
});

function signatureVerificationPayload(): array
{
    return [
        'success' => true,
        'threshold' => 0.85,
        'signatures' => [
            [
                'slot' => 'sig1_prepared_by',
                'label' => 'Prepared By',
                'best_match_id' => 'abadia',
                'best_match_name' => 'Judito T. Abadia',
                'distance' => 0.42,
                'is_match' => true,
                'ink_pixels' => 25,
                'bbox_xywh' => [1, 2, 3, 4],
                'band_crop_url' => 'http://127.0.0.1:8001/media/signatures/job/sig1_prepared_by_band.png',
                'ink_mask_url' => 'http://127.0.0.1:8001/media/signatures/job/sig1_prepared_by_ink_mask.png',
                'error' => '',
            ],
        ],
        'error' => '',
    ];
}

test('tor analysis stores no result when django returns a failed analysis', function () {
    Storage::fake('local');
    Http::preventStrayRequests();
    Http::fake([
        'http://127.0.0.1:8001/api/images/' => Http::response([
            'status' => 'failed',
            'result' => [
                'success' => false,
                'error' => 'Empty patch list',
            ],
            'error' => 'Empty patch list',
        ], 422),
    ]);

    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('tor.jpg');

    $this->actingAs($user)
        ->from(route('uploadTor'))
        ->post(route('uploadTor.analyze'), [
            'tor_file' => $file,
        ])
        ->assertRedirect(route('uploadTor'))
        ->assertSessionHasErrors('tor_file');

    expect(TorAnalysisResult::query()->whereBelongsTo($user)->exists())->toBeFalse();
    expect(Storage::disk('local')->allFiles('tor-analysis/tmp'))->toBe([]);
});

test('tor analysis stores no result when django cannot be reached', function () {
    Storage::fake('local');
    Http::preventStrayRequests();
    Http::fake(fn () => throw new ConnectionException('Connection refused.'));

    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('tor.jpg');

    $this->actingAs($user)
        ->from(route('uploadTor'))
        ->post(route('uploadTor.analyze'), [
            'tor_file' => $file,
        ])
        ->assertRedirect(route('uploadTor'))
        ->assertSessionHasErrors('tor_file');

    expect(TorAnalysisResult::query()->whereBelongsTo($user)->exists())->toBeFalse();
    expect(Storage::disk('local')->allFiles('tor-analysis/tmp'))->toBe([]);
});

test('tor analysis rejects invalid file types', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->create('tor.pdf', 100, 'application/pdf');

    $this->actingAs($user)
        ->from(route('uploadTor'))
        ->post(route('uploadTor.analyze'), [
            'tor_file' => $file,
        ])
        ->assertRedirect(route('uploadTor'))
        ->assertSessionHasErrors('tor_file');

    expect(TorAnalysisResult::query()->whereBelongsTo($user)->exists())->toBeFalse();
});

test('tor analysis rejects images larger than ten megabytes', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('tor.jpg')->size(10241);

    $this->actingAs($user)
        ->from(route('uploadTor'))
        ->post(route('uploadTor.analyze'), [
            'tor_file' => $file,
        ])
        ->assertRedirect(route('uploadTor'))
        ->assertSessionHasErrors('tor_file');

    expect(TorAnalysisResult::query()->whereBelongsTo($user)->exists())->toBeFalse();
});
