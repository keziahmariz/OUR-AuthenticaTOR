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
        Schema::create('signature_personnel_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('signature_personnel_id')->constrained('signature_personnels')->cascadeOnDelete();
            $table->string('slot');
            $table->timestamps();

            $table->unique(['signature_personnel_id', 'slot']);
            $table->index('slot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signature_personnel_slots');
    }
};
