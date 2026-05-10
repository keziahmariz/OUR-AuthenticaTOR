<?php

namespace App\Models;

use Database\Factories\SignaturePersonnelSlotFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['signature_personnel_id', 'slot'])]
class SignaturePersonnelSlot extends Model
{
    /** @use HasFactory<SignaturePersonnelSlotFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<SignaturePersonnel, $this>
     */
    public function personnel(): BelongsTo
    {
        return $this->belongsTo(SignaturePersonnel::class, 'signature_personnel_id');
    }
}
