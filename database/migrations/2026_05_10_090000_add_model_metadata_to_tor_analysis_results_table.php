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
            $table->string('model_key')->default('efficientnet_b0')->after('django_job_id');
            $table->string('model_label')->default('EfficientNet-B0 baseline')->after('model_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tor_analysis_results', function (Blueprint $table): void {
            $table->dropColumn([
                'model_key',
                'model_label',
            ]);
        });
    }
};
