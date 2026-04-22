<?php

namespace App\Http\Controllers;

use App\Models\WelcomePageContent;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class WelcomePageController extends Controller
{
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
                    ? Storage::url($welcomeContent->logo_image_path)
                    : null,
                'heroBackground' => $welcomeContent?->hero_background_image_path
                    ? Storage::url($welcomeContent->hero_background_image_path)
                    : null,
                'torPreview' => $welcomeContent?->tor_preview_image_path
                    ? Storage::url($welcomeContent->tor_preview_image_path)
                    : null,
            ],
        ]);
    }
}
