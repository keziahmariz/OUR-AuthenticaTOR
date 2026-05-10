<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadTorAnalysisRequest extends FormRequest
{
    private const PreparedAndCheckedSignatories = [
        'abadia',
        'arabejo',
        'calunsag',
        'corotan',
        'dagohoy',
        'kusain',
        'llerin',
        'mamac',
        'mansueto',
        'munoz',
        'vistar',
    ];

    private const ModelKeys = [
        'efficientnet_b0',
        'resnet50_mean',
    ];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tor_file' => ['required', 'file', 'mimetypes:image/jpeg,image/png', 'max:10240'],
            'model_key' => ['required', 'string', Rule::in(self::ModelKeys)],
            'expected_signatures' => ['required', 'array'],
            'expected_signatures.sig1_prepared_by' => ['required', 'string', Rule::in(self::PreparedAndCheckedSignatories)],
            'expected_signatures.sig2_checked_by' => ['required', 'string', Rule::in(self::PreparedAndCheckedSignatories)],
            'expected_signatures.sig3_certified_by' => ['required', 'string', Rule::in(['maniscan'])],
        ];
    }
}
