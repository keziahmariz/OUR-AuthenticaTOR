<?php

use App\Models\TorAnalysisResult;
use App\Models\User;
use Illuminate\Http\UploadedFile;
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
        ->forgery_confidence->toBe(93.3)
        ->authenticity_score->toBe(8.7)
        ->verdict->toBe('Likely Forged')
        ->detected_indicators->toHaveCount(3);

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
