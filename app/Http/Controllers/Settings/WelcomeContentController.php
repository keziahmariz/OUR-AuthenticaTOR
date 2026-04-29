<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\WelcomeContentUpdateRequest;
use App\Models\WelcomePageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeContentController extends Controller
{
    /**
     * Show the welcome content CMS page.
     */
    public function edit(Request $request): Response
    {
        $welcomeContent = WelcomePageContent::query()->first();

        return Inertia::render('settings/welcome-content', [
            'content' => WelcomePageContent::mergeContent($welcomeContent?->content),
            'images' => $this->imageUrls($welcomeContent),
        ]);
    }

    /**
     * Update the welcome content.
     */
    public function update(WelcomeContentUpdateRequest $request): RedirectResponse
    {
        $welcomeContent = WelcomePageContent::query()->firstOrCreate(
            ['id' => 1],
            ['content' => WelcomePageContent::defaultContent()],
        );

        $welcomeContent->content = $request->validated('content');
        $welcomeContent->updated_by = $request->user()->id;

        $this->storeUploadedImage($request, $welcomeContent, 'logo_image', 'logo_image_path');
        $this->storeUploadedImage($request, $welcomeContent, 'hero_background_image', 'hero_background_image_path');
        $this->storeUploadedImage($request, $welcomeContent, 'tor_preview_image', 'tor_preview_image_path');

        $welcomeContent->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Welcome page content updated.')]);

        return to_route('welcome-content.edit');
    }

    /**
     * Persist and replace uploaded images.
     */
    protected function storeUploadedImage(
        WelcomeContentUpdateRequest $request,
        WelcomePageContent $welcomeContent,
        string $requestKey,
        string $column
    ): void {
        if (! $request->hasFile($requestKey)) {
            return;
        }

        if ($welcomeContent->{$column}) {
            Storage::disk('public')->delete($welcomeContent->{$column});
        }

        $welcomeContent->{$column} = $request->file($requestKey)->store('welcome-content', 'public');
    }

    /**
     * Build image URLs for CMS and public usage.
     *
     * @return array{logo: string|null, heroBackground: string|null, torPreview: string|null}
     */
    protected function imageUrls(?WelcomePageContent $welcomeContent): array
    {
        return [
            'logo' => $welcomeContent?->logo_image_path
                ? Storage::disk('public')->url($welcomeContent->logo_image_path)
                : null,
            'heroBackground' => $welcomeContent?->hero_background_image_path
                ? Storage::disk('public')->url($welcomeContent->hero_background_image_path)
                : null,
            'torPreview' => $welcomeContent?->tor_preview_image_path
                ? Storage::disk('public')->url($welcomeContent->tor_preview_image_path)
                : null,
        ];
    }
}
