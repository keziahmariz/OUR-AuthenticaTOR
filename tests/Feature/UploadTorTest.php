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

    expect(Storage::disk('local')->allFiles('tor-analysis/tmp'))->toBe([]);

    Http::assertSent(fn ($request): bool => $request->url() === 'http://127.0.0.1:8001/api/images/'
        && $request->hasHeader('X-TOR-Service-Token', 'testing-token'));
});

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
