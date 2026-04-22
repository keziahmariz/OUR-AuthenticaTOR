<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class WelcomeContentUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manageWelcomeContent') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => ['required', 'array'],

            'content.hero.badge_left' => ['required', 'string', 'max:60'],
            'content.hero.badge_right' => ['required', 'string', 'max:60'],
            'content.hero.line_one' => ['required', 'string', 'max:80'],
            'content.hero.line_highlight' => ['required', 'string', 'max:80'],
            'content.hero.line_three' => ['required', 'string', 'max:80'],
            'content.hero.description' => ['required', 'string', 'max:500'],
            'content.hero.cta_label' => ['required', 'string', 'max:60'],
            'content.hero.cta_note' => ['required', 'string', 'max:180'],
            'content.hero.tor_title' => ['required', 'string', 'max:120'],
            'content.hero.tor_stamp' => ['required', 'string', 'max:60'],
            'content.hero.verdict_title' => ['required', 'string', 'max:40'],
            'content.hero.verdict_detail' => ['required', 'string', 'max:180'],

            'content.metrics.training_samples' => ['required', 'string', 'max:20'],
            'content.metrics.training_label' => ['required', 'string', 'max:60'],
            'content.metrics.detection_accuracy' => ['required', 'string', 'max:20'],
            'content.metrics.detection_label' => ['required', 'string', 'max:60'],
            'content.metrics.f1_score' => ['required', 'string', 'max:20'],
            'content.metrics.f1_label' => ['required', 'string', 'max:60'],

            'content.about.eyebrow' => ['required', 'string', 'max:60'],
            'content.about.title' => ['required', 'string', 'max:120'],
            'content.about.description' => ['required', 'string', 'max:600'],
            'content.about.steps' => ['required', 'array', 'size:3'],
            'content.about.steps.*.title' => ['required', 'string', 'max:80'],
            'content.about.steps.*.description' => ['required', 'string', 'max:400'],

            'content.thesis.eyebrow' => ['required', 'string', 'max:60'],
            'content.thesis.title' => ['required', 'string', 'max:120'],
            'content.thesis.description' => ['required', 'string', 'max:500'],
            'content.thesis.cards' => ['required', 'array', 'size:4'],
            'content.thesis.cards.*.label' => ['required', 'string', 'max:40'],
            'content.thesis.cards.*.value' => ['required', 'string', 'max:500'],

            'content.footer.university' => ['required', 'string', 'max:120'],
            'content.footer.office' => ['required', 'string', 'max:120'],
            'content.footer.location' => ['required', 'string', 'max:120'],
            'content.footer.email' => ['required', 'string', 'max:120'],
            'content.footer.system_name' => ['required', 'string', 'max:180'],
            'content.footer.college' => ['required', 'string', 'max:120'],
            'content.footer.tag_one' => ['required', 'string', 'max:60'],
            'content.footer.tag_two' => ['required', 'string', 'max:60'],
            'content.footer.copyright' => ['required', 'string', 'max:200'],

            'logo_image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/svg+xml', 'max:4096'],
            'hero_background_image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/svg+xml', 'max:6144'],
            'tor_preview_image' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/svg+xml', 'max:6144'],
        ];
    }
}
