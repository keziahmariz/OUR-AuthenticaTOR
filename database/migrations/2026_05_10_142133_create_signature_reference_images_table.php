<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('signature_reference_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('signature_personnel_id')->constrained('signature_personnels')->cascadeOnDelete();
            $table->string('slot');
            $table->string('path');
            $table->string('original_filename');
            $table->string('sync_status')->default('pending');
            $table->text('sync_error')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index(['signature_personnel_id', 'slot']);
            $table->index('sync_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signature_reference_images');
    }
};
