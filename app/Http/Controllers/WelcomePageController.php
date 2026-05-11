<?php

namespace App\Http\Controllers;

use App\Models\WelcomePageContent;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class WelcomePageController extends Controller
{
    private const DEFAULT_LOGO_IMAGE = '/usep-logo-small.png';

    private const DEFAULT_HERO_BACKGROUND_IMAGE = '/welcome-hero-background.png';

    private const DEFAULT_TOR_PREVIEW_IMAGE = '/welcome-tor-preview.svg';

    /**
     * Display the public welcome page.
     */
    public function __invoke(): Response
    {
        $welcomeContent = WelcomePageContent::query()->first();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'content' => WelcomePageContent::mergeContent($welcomeContent?->content),
            'images' => [
                'logo' => $welcomeContent?->logo_image_path
                    ? Storage::disk('public')->url($welcomeContent->logo_image_path)
                    : self::DEFAULT_LOGO_IMAGE,
                'heroBackground' => $welcomeContent?->hero_background_image_path
                    ? Storage::disk('public')->url($welcomeContent->hero_background_image_path)
                    : self::DEFAULT_HERO_BACKGROUND_IMAGE,
                'torPreview' => $welcomeContent?->tor_preview_image_path
                    ? Storage::disk('public')->url($welcomeContent->tor_preview_image_path)
                    : self::DEFAULT_TOR_PREVIEW_IMAGE,
            ],
        ]);
    }
}
