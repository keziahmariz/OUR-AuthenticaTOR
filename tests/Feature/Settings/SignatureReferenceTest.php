<?php

use App\Models\SignaturePersonnel;
use App\Models\SignatureReferenceImage;
use App\Models\User;
use Database\Seeders\SignaturePersonnelSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(SignaturePersonnelSeeder::class);
});

test('non admin users cannot access signature settings', function () {
    $this->withoutVite();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('signatures.edit'))
        ->assertForbidden();
});

test('admin users can view seeded signature personnel', function () {
    $this->withoutVite();

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('signatures.edit'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('settings/signatures')
                ->where('personnel.0.slug', 'abadia')
                ->where('slots.sig1_prepared_by', '1st Signatory - Prepared By'),
        );
});

test('admin users can upload and sync signature reference images', function () {
    Storage::fake('local');
    Http::preventStrayRequests();
    Http::fake([
        'http://127.0.0.1:8001/api/signature-references/sync/' => Http::response(['success' => true]),
    ]);
    config([
        'services.tor_model.url' => 'http://127.0.0.1:8001',
        'services.tor_model.token' => 'testing-token',
    ]);

    $admin = User::factory()->admin()->create();
    $personnel = SignaturePersonnel::query()->where('slug', 'abadia')->firstOrFail();

    $this->actingAs($admin)
        ->post(route('signatures.references.store'), [
            'signature_personnel_id' => $personnel->id,
            'slot' => 'sig1_prepared_by',
            'images' => [
                UploadedFile::fake()->image('abadia.png'),
            ],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('signatures.edit'));

    $image = SignatureReferenceImage::query()->firstOrFail();

    expect($image)
        ->signature_personnel_id->toBe($personnel->id)
        ->slot->toBe('sig1_prepared_by')
        ->sync_status->toBe(SignatureReferenceImage::SyncSucceeded);

    Storage::disk('local')->assertExists($image->path);
    Http::assertSent(fn ($request): bool => $request->url() === 'http://127.0.0.1:8001/api/signature-references/sync/'
        && $request->hasHeader('X-TOR-Service-Token', 'testing-token'));
});

test('signature uploads reject slots the personnel is not eligible for', function () {
    Storage::fake('local');
    Http::preventStrayRequests();

    $admin = User::factory()->admin()->create();
    $personnel = SignaturePersonnel::query()->where('slug', 'maniscan')->firstOrFail();

    $this->actingAs($admin)
        ->from(route('signatures.edit'))
        ->post(route('signatures.references.store'), [
            'signature_personnel_id' => $personnel->id,
            'slot' => 'sig1_prepared_by',
            'images' => [
                UploadedFile::fake()->image('maniscan.png'),
            ],
        ])
        ->assertRedirect(route('signatures.edit'))
        ->assertSessionHasErrors('slot');
});
