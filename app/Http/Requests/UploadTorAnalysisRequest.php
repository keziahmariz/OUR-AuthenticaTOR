<?php

namespace App\Http\Requests;

use App\Models\SignaturePersonnelSlot;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\In;

class UploadTorAnalysisRequest extends FormRequest
{
    private const ModelKeys = [
        'efficientnet_b0_topk',
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
            'expected_signatures.sig1_prepared_by' => ['required', 'string', $this->activeSlotPersonnelRule('sig1_prepared_by')],
            'expected_signatures.sig2_checked_by' => ['required', 'string', $this->activeSlotPersonnelRule('sig2_checked_by')],
            'expected_signatures.sig3_certified_by' => ['required', 'string', $this->activeSlotPersonnelRule('sig3_certified_by')],
        ];
    }

    private function activeSlotPersonnelRule(string $slot): In
    {
        $allowedSlugs = SignaturePersonnelSlot::query()
            ->where('slot', $slot)
            ->whereHas('personnel', fn ($query) => $query->where('is_active', true))
            ->join('signature_personnels', 'signature_personnels.id', '=', 'signature_personnel_slots.signature_personnel_id')
            ->pluck('signature_personnels.slug')
            ->all();

        return Rule::in($allowedSlugs);
    }
}
