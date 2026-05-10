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
            $table->uuid('external_id')->nullable()->unique()->after('user_id');
            $table->unsignedBigInteger('django_job_id')->nullable()->after('external_id');
            $table->json('model_result')->nullable()->after('gradcam_attention_map_url');
            $table->json('preprocessing')->nullable()->after('model_result');
            $table->text('error')->nullable()->after('preprocessing');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tor_analysis_results', function (Blueprint $table): void {
            $table->dropColumn([
                'external_id',
                'django_job_id',
                'model_result',
                'preprocessing',
                'error',
            ]);
        });
    }
};
