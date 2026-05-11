<?php

use App\Models\WelcomePageContent;
use Inertia\Testing\AssertableInertia as Assert;

test('welcome page is displayed', function () {
    $this->withoutVite();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('welcome')
                ->where('content.hero.line_highlight', 'TOR Forgeries')
                ->where('images.logo', '/usep-logo-small.png')
                ->where('images.heroBackground', '/welcome-hero-background.png')
                ->where('images.torPreview', '/welcome-tor-preview.png'),
        );
});

test('welcome page displays stored cms content', function () {
    $this->withoutVite();

    WelcomePageContent::factory()->create([
        'content' => array_replace_recursive(
            WelcomePageContent::defaultContent(),
            [
                'hero' => [
                    'line_highlight' => 'Custom Highlight',
                ],
                'metrics' => [
                    'training_samples' => '999K+',
                ],
            ],
        ),
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('welcome')
                ->where('content.hero.line_highlight', 'Custom Highlight')
                ->where('content.metrics.training_samples', '999K+'),
        );
});
