<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AcademicProgramSaveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manageAcademicPrograms') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'campus' => ['required', 'string', 'max:120'],
            'college' => ['required', 'string', 'max:160'],
            'program_level' => ['required', 'string', 'max:80'],
            'degree' => ['required', 'string', 'max:200'],
            'specialization' => ['nullable', 'string', 'max:200'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
