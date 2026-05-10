<?php

namespace App\Models;

use Database\Factories\SignatureReferenceImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'signature_personnel_id',
    'slot',
    'path',
    'original_filename',
    'sync_status',
    'sync_error',
    'synced_at',
])]
class SignatureReferenceImage extends Model
{
    public const SyncPending = 'pending';

    public const SyncSucceeded = 'succeeded';

    public const SyncFailed = 'failed';

    /** @use HasFactory<SignatureReferenceImageFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'synced_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<SignaturePersonnel, $this>
     */
    public function personnel(): BelongsTo
    {
        return $this->belongsTo(SignaturePersonnel::class, 'signature_personnel_id');
    }
}
