<?php

namespace App\Models;

use Database\Factories\SignaturePersonnelFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['slug', 'name', 'is_active', 'sort_order'])]
class SignaturePersonnel extends Model
{
    /** @use HasFactory<SignaturePersonnelFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return HasMany<SignaturePersonnelSlot, $this>
     */
    public function slots(): HasMany
    {
        return $this->hasMany(SignaturePersonnelSlot::class);
    }

    /**
     * @return HasMany<SignatureReferenceImage, $this>
     */
    public function referenceImages(): HasMany
    {
        return $this->hasMany(SignatureReferenceImage::class);
    }
}
