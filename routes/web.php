<?php

use App\Http\Controllers\UploadTorController;
use App\Http\Controllers\WelcomePageController;
use Illuminate\Support\Facades\Route;

Route::get('/', WelcomePageController::class)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('upload-tor', UploadTorController::class)->name('uploadTor');
    Route::post('upload-tor/analyze', [UploadTorController::class, 'analyze'])->name('uploadTor.analyze');
    Route::get('upload-tor/{torAnalysisResult}/preprocessed-image', [UploadTorController::class, 'preprocessedImage'])->name('uploadTor.preprocessedImage');
});

require __DIR__.'/settings.php';
