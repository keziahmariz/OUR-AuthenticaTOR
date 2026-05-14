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
                ->where('content.metrics.training_samples', '135K+')
                ->where('content.metrics.f1_score', '0.90')
                ->where('content.about.steps.2.description', 'Each check produces a verdict - Likely Authentic or Suspicious - with a per-region score and graph.')
                ->where('content.thesis.cards.3.label', 'TRAINING SAMPLES')
                ->where('images.logo', '/usep-logo-small.png')
                ->where('images.heroBackground', '/welcome-hero-background.png')
                ->where('images.torPreview', '/welcome-tor-preview.svg'),
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
