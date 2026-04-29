<?php

use App\Models\User;
use App\Models\WelcomePageContent;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('non admin users cannot access welcome content settings', function () {
    $this->withoutVite();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('welcome-content.edit'))
        ->assertForbidden();
});

test('admin users can access welcome content settings', function () {
    $this->withoutVite();

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('welcome-content.edit'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('settings/welcome-content')
                ->where('content.hero.line_highlight', 'TOR Forgeries'),
        );
});

test('admin users can update welcome content and upload images', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();

    $payload = array_replace_recursive(
        WelcomePageContent::defaultContent(),
        [
            'hero' => [
                'line_highlight' => 'CMS Updated Highlight',
            ],
            'about' => [
                'title' => 'Updated About Title',
            ],
        ],
    );

    $this->actingAs($admin)
        ->patch(route('welcome-content.update'), [
            'content' => $payload,
            'logo_image' => UploadedFile::fake()->image('logo.jpg'),
            'hero_background_image' => UploadedFile::fake()->image('hero.jpg'),
            'tor_preview_image' => UploadedFile::fake()->image('tor.png'),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('welcome-content.edit'));

    $record = WelcomePageContent::query()->first();

    expect($record)->not->toBeNull();
    expect(data_get($record?->content, 'hero.line_highlight'))->toBe('CMS Updated Highlight');
    expect(data_get($record?->content, 'about.title'))->toBe('Updated About Title');
    expect($record?->updated_by)->toBe($admin->id);

    expect(
        Storage::disk('public')->exists((string) $record?->logo_image_path),
    )->toBeTrue();
    expect(
        Storage::disk('public')->exists((string) $record?->hero_background_image_path),
    )->toBeTrue();
    expect(
        Storage::disk('public')->exists((string) $record?->tor_preview_image_path),
    )->toBeTrue();
});
