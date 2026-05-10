<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SignatureReferenceUploadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manageSignatures') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'signature_personnel_id' => ['required', 'integer', 'exists:signature_personnels,id'],
            'slot' => [
                'required',
                'string',
                Rule::exists('signature_personnel_slots', 'slot')
                    ->where('signature_personnel_id', (int) $this->input('signature_personnel_id')),
            ],
            'images' => ['required', 'array', 'min:1', 'max:20'],
            'images.*' => ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/bmp', 'max:4096'],
        ];
    }
}
