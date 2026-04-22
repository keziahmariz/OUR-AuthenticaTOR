<?php

use App\Http\Controllers\WelcomePageController;
use Illuminate\Support\Facades\Route;

Route::get('/', WelcomePageController::class)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
