<?php

use App\Http\Controllers\Settings\AcademicProgramController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\SignatureReferenceController;
use App\Http\Controllers\Settings\WelcomeContentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/welcome-content', [WelcomeContentController::class, 'edit'])
        ->can('manageWelcomeContent')
        ->name('welcome-content.edit');

    Route::patch('settings/welcome-content', [WelcomeContentController::class, 'update'])
        ->can('manageWelcomeContent')
        ->name('welcome-content.update');

    Route::get('settings/signatures', [SignatureReferenceController::class, 'edit'])
        ->can('manageSignatures')
        ->name('signatures.edit');

    Route::patch('settings/signatures/{signaturePersonnel}', [SignatureReferenceController::class, 'update'])
        ->can('manageSignatures')
        ->name('signatures.update');

    Route::post('settings/signatures/references', [SignatureReferenceController::class, 'store'])
        ->can('manageSignatures')
        ->name('signatures.references.store');

    Route::get('settings/academic-programs', [AcademicProgramController::class, 'edit'])
        ->can('manageAcademicPrograms')
        ->name('academic-programs.edit');

    Route::post('settings/academic-programs', [AcademicProgramController::class, 'store'])
        ->can('manageAcademicPrograms')
        ->name('academic-programs.store');

    Route::patch('settings/academic-programs/{academicProgram}', [AcademicProgramController::class, 'update'])
        ->can('manageAcademicPrograms')
        ->name('academic-programs.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});
