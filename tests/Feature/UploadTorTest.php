<?php

use App\Models\AcademicProgram;
use App\Models\TorAnalysisResult;
use App\Models\User;
use Database\Seeders\AcademicProgramSeeder;
use Database\Seeders\SignaturePersonnelSeeder;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(SignaturePersonnelSeeder::class);
    $this->seed(AcademicProgramSeeder::class);
});

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
                ->where('latestAnalysis', null)
                ->where('signaturePersonnel.sig1_prepared_by.0.id', 'abadia')
                ->where('signaturePersonnel.sig3_certified_by.0.id', 'maniscan'),
        );
});

test('upload tor page exposes a laravel proxy url for the latest preprocessed image', function () {
    $this->withoutVite();

    $user = User::factory()->create();
    $analysis = TorAnalysisResult::query()->create([
        'user_id' => $user->id,
        'external_id' => fake()->uuid(),
        'django_job_id' => 11,
        'model_key' => 'efficientnet_b0_topk',
        'model_label' => 'EfficientNet-B0 top-k aggregation',
        'forgery_confidence' => 93.3,
        'authenticity_score' => 6.7,
        'verdict' => 'Suspicious',
        'detected_indicators' => ['Document suspiciousness: 93.3%'],
        'preprocessed_image_url' => 'http://127.0.0.1:8001/media/preprocessed/tor.jpg',
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
                ->where('latestAnalysis.model_key', 'efficientnet_b0_topk')
                ->where('latestAnalysis.model_label', 'EfficientNet-B0 top-k aggregation')
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
        'verdict' => 'Suspicious',
        'detected_indicators' => ['Document suspiciousness: 93.3%'],
        'preprocessed_image_url' => 'http://127.0.0.1:8001/media/preprocessed/tor.jpg',
        'model_result' => [
            'label' => 'fake',
            'score' => 0.933,
            'degree_extraction' => degreeExtractionPayload(),
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
                ->where('latestAnalysis.model_result.degree_extraction.degree', 'Bachelor of Science in Information Technology')
                ->where('latestAnalysis.signature_verification.success', true)
                ->where('latestAnalysis.signature_verification.signatures.0.best_match_name', 'Judito T. Abadia')
                ->where('latestAnalysis.signature_results.0.best_match_name', 'Judito T. Abadia')
                ->where(
                    'latestAnalysis.signature_verification.signatures.0.band_crop_url',
                    route('uploadTor.signatureArtifact', [
                        'torAnalysisResult' => $analysis,
                        'url' => 'http://127.0.0.1:8001/media/signatures/job/sig1_prepared_by_band.png',
                    ]),
                ),
        );
});

test('upload tor page refreshes stored OCR program matches from active programs', function () {
    $this->withoutVite();

    AcademicProgram::factory()->create([
        'degree' => 'Master of Science in Biology',
        'specialization' => null,
        'normalized_degree' => AcademicProgram::normalizeDegree('Master of Science in Biology'),
    ]);

    $user = User::factory()->create();
    $analysis = TorAnalysisResult::query()->create([
        'user_id' => $user->id,
        'external_id' => fake()->uuid(),
        'django_job_id' => 11,
        'forgery_confidence' => 12.3,
        'authenticity_score' => 87.7,
        'verdict' => 'Likely Authentic',
        'detected_indicators' => ['Document suspiciousness: 12.3%'],
        'preprocessed_image_url' => null,
        'model_result' => [
            'label' => 'real',
            'score' => 0.123,
            'degree_extraction' => [
                ...degreeExtractionPayload(),
                'degree' => 'MASTER OF SCIENCE IN BIOLOGY (tSBlo)',
                'title' => 'MASTER OF SCIENCE IN BIOLOGY (tSBlo)',
                'course' => 'MASTER OF SCIENCE IN BIOLOGY (tSBlo)',
                'program_match' => [
                    'matched' => false,
                    'normalized_degree' => 'master of science in biology tsblo',
                    'program' => null,
                ],
            ],
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
                ->where('latestAnalysis.model_result.degree_extraction.program_match.matched', true)
                ->where('latestAnalysis.academic_program_match.matched', true)
                ->where('latestAnalysis.academic_program_match.program_snapshot.degree', 'Master of Science in Biology')
                ->where('latestAnalysis.model_result.degree_extraction.program_match.program.degree', 'Master of Science in Biology'),
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
        'verdict' => 'Suspicious',
        'detected_indicators' => ['Document suspiciousness: 93.3%'],
        'preprocessed_image_url' => 'http://127.0.0.1:8001/media/preprocessed/tor.jpg',
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
        'verdict' => 'Suspicious',
        'detected_indicators' => ['Document suspiciousness: 93.3%'],
        'preprocessed_image_url' => 'http://127.0.0.1:8001/media/preprocessed/tor.jpg',
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
        'verdict' => 'Suspicious',
        'detected_indicators' => ['Document suspiciousness: 93.3%'],
        'preprocessed_image_url' => null,
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
        'verdict' => 'Suspicious',
        'detected_indicators' => ['Document suspiciousness: 93.3%'],
        'preprocessed_image_url' => null,
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
        'verdict' => 'Suspicious',
        'detected_indicators' => ['Document suspiciousness: 93.3%'],
        'preprocessed_image_url' => null,
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
    $modelRequestBody = '';
    Http::fake(function ($request) use (&$modelRequestBody) {
        $modelRequestBody = $request->body();

        return Http::response([
            'id' => 11,
            'job_id' => 11,
            'model_key' => 'efficientnet_b0_topk',
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
                'threshold' => 0.8,
                'aggregation' => 'topk_mean',
                'roi_scores' => [
                    'header' => ['n_patches' => 1, 'top5_mean' => 0.2],
                    'body' => ['n_patches' => 2, 'top5_mean' => 0.4],
                    'footer' => ['n_patches' => 3, 'top5_mean' => 0.933],
                ],
                'top_roi' => 'footer',
                'degree_extraction' => degreeExtractionPayload(),
                'signature_verification' => signatureVerificationPayload(),
                'error' => '',
            ],
            'error' => '',
        ], 201);
    });
    config([
        'services.tor_model.token' => 'testing-token',
        'services.tor_model.url' => 'http://127.0.0.1:8001',
    ]);

    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('tor.jpg');

    $this->actingAs($user)
        ->post(route('uploadTor.analyze'), [
            'tor_file' => $file,
            'expected_signatures' => expectedSignaturesPayload(),
            'model_key' => 'efficientnet_b0_topk',
        ])
        ->assertRedirect(route('uploadTor'));

    expect(TorAnalysisResult::query()->whereBelongsTo($user)->count())->toBe(1);

    $analysis = TorAnalysisResult::query()->whereBelongsTo($user)->first();

    expect($analysis)
        ->external_id->not->toBeEmpty()
        ->django_job_id->toBe(11)
        ->model_key->toBe('efficientnet_b0_topk')
        ->model_label->toBe('EfficientNet-B0 top-k aggregation')
        ->forgery_confidence->toBe(93.3)
        ->authenticity_score->toBe(6.7)
        ->verdict->toBe('Suspicious')
        ->detected_indicators->toHaveCount(7)
        ->preprocessed_image_url->toBe('http://127.0.0.1:8001/media/preprocessed/tor.jpg')
        ->model_result->toMatchArray(['label' => 'fake', 'score' => 0.933])
        ->preprocessing->toMatchArray(['method' => 'brightness', 'skew_status' => 'flat']);

    expect($analysis->detected_indicators[0])->toBe('Document suspiciousness: 93.3%');
    expect($analysis->detected_indicators[1])->toBe('Authenticity support: 6.7%');
    expect($analysis->detected_indicators[2])->toBe('Most suspicious region: Footer');
    expect($analysis->detected_indicators[3])->toContain('ROI top5 means');
    expect($analysis->model_result['degree_extraction']['degree'])->toBe('Bachelor of Science in Information Technology');
    expect($analysis->model_result['degree_extraction']['program_match']['matched'])->toBeTrue();
    expect($analysis->model_result['degree_extraction']['program_match']['program']['degree'])->toBe('Bachelor of Science in Information Technology');
    expect($analysis->model_result['signature_verification']['success'])->toBeTrue();
    expect($analysis->signatureResults()->count())->toBe(1);
    expect($analysis->signatureResults()->first())
        ->slot->toBe('sig1_prepared_by')
        ->score->toBe(0.62)
        ->distance->toBe(0.42)
        ->best_match_name->toBe('Judito T. Abadia');
    expect($analysis->programMatch)
        ->matched->toBeTrue()
        ->score->toBe(1.0);
    expect($analysis->programMatch->program_snapshot['degree'])->toBe('Bachelor of Science in Information Technology');

    expect(Storage::disk('local')->allFiles('tor-analysis/tmp'))->toBe([]);

    Http::assertSent(fn ($request): bool => $request->url() === 'http://127.0.0.1:8001/api/images/'
        && $request->hasHeader('X-TOR-Service-Token', 'testing-token'));
    expect($modelRequestBody)
        ->toContain('name="model_key"')
        ->toContain('efficientnet_b0_topk');
});

test('tor analysis rejects invalid model keys', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('tor.jpg');

    $this->actingAs($user)
        ->from(route('uploadTor'))
        ->post(route('uploadTor.analyze'), [
            'tor_file' => $file,
            'expected_signatures' => expectedSignaturesPayload(),
            'model_key' => 'unknown_model',
        ])
        ->assertRedirect(route('uploadTor'))
        ->assertSessionHasErrors('model_key');

    expect(TorAnalysisResult::query()->whereBelongsTo($user)->exists())->toBeFalse();
});

function expectedSignaturesPayload(): array
{
    return [
        'sig1_prepared_by' => 'abadia',
        'sig2_checked_by' => 'arabejo',
        'sig3_certified_by' => 'maniscan',
    ];
}

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
                'score' => 0.62,
                'verdict' => 'GENUINE',
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

function degreeExtractionPayload(): array
{
    return [
        'success' => true,
        'degree' => 'Bachelor of Science in Information Technology',
        'title' => 'Bachelor of Science in Information Technology',
        'course' => 'Bachelor of Science in Information Technology',
        'program_match' => null,
        'message' => 'Degree extracted from TOR OCR.',
        'raw_text' => "Degree/Title/Course:\nBachelor of Science in Information Technology",
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
            'expected_signatures' => expectedSignaturesPayload(),
            'model_key' => 'efficientnet_b0_topk',
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
            'expected_signatures' => expectedSignaturesPayload(),
            'model_key' => 'efficientnet_b0_topk',
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
            'expected_signatures' => expectedSignaturesPayload(),
            'model_key' => 'efficientnet_b0_topk',
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
            'expected_signatures' => expectedSignaturesPayload(),
            'model_key' => 'efficientnet_b0_topk',
        ])
        ->assertRedirect(route('uploadTor'))
        ->assertSessionHasErrors('tor_file');

    expect(TorAnalysisResult::query()->whereBelongsTo($user)->exists())->toBeFalse();
});
