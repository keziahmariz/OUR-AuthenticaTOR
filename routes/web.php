<?php

use App\Http\Controllers\WelcomePageController;
use Illuminate\Support\Facades\Route;

Route::get('/', WelcomePageController::class)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('upload-tor', 'upload-tor')->name('uploadTor');
});

require __DIR__.'/settings.php';
