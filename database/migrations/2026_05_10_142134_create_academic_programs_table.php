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
        Schema::create('academic_programs', function (Blueprint $table) {
            $table->id();
            $table->string('campus');
            $table->string('college');
            $table->string('program_level');
            $table->string('degree');
            $table->string('specialization')->nullable();
            $table->string('normalized_degree');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('normalized_degree');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_programs');
    }
};
