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
        Schema::table('tor_analysis_results', function (Blueprint $table): void {
            $table->renameColumn('gradcam_attention_map_url', 'preprocessed_image_url');
            $table->double('forgery_confidence')->change();
            $table->double('authenticity_score')->change();
        });

        Schema::create('tor_analysis_signature_results', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tor_analysis_result_id')->constrained()->cascadeOnDelete();
            $table->string('slot');
            $table->string('label')->nullable();
            $table->string('best_match_id')->nullable();
            $table->string('best_match_name')->nullable();
            $table->double('distance')->nullable();
            $table->double('score')->nullable();
            $table->string('verdict')->nullable();
            $table->string('status')->nullable();
            $table->boolean('is_match')->default(false);
            $table->boolean('signature_detected')->nullable();
            $table->boolean('model_inference_ran')->nullable();
            $table->unsignedInteger('ink_pixels')->nullable();
            $table->double('ink_ratio')->nullable();
            $table->unsignedInteger('max_component_area')->nullable();
            $table->unsignedInteger('signature_like_components')->nullable();
            $table->json('bbox_xywh')->nullable();
            $table->string('band_crop_url')->nullable();
            $table->string('ink_mask_url')->nullable();
            $table->string('debug_image_url')->nullable();
            $table->text('message')->nullable();
            $table->text('error')->nullable();
            $table->json('raw_result');
            $table->timestamps();

            $table->unique(['tor_analysis_result_id', 'slot']);
        });

        Schema::create('tor_analysis_program_matches', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tor_analysis_result_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_program_id')->nullable()->constrained()->nullOnDelete();
            $table->string('extracted_degree')->nullable();
            $table->string('normalized_degree')->nullable();
            $table->boolean('matched')->default(false);
            $table->double('score')->nullable();
            $table->json('program_snapshot')->nullable();
            $table->json('raw_match')->nullable();
            $table->timestamps();

            $table->unique('tor_analysis_result_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tor_analysis_program_matches');
        Schema::dropIfExists('tor_analysis_signature_results');

        Schema::table('tor_analysis_results', function (Blueprint $table): void {
            $table->renameColumn('preprocessed_image_url', 'gradcam_attention_map_url');
            $table->decimal('forgery_confidence', 5, 2)->change();
            $table->decimal('authenticity_score', 5, 2)->change();
        });
    }
};
