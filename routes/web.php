<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [HomeController::class, 'home'])->name('home');
    Route::get('/conversation/{user}', [MessageController::class, 'byUser'])->name('chat.byUser');
    Route::get('/group/{group}', [MessageController::class, 'byGroup'])->name('chat.byGroup');

    Route::post('/message', [MessageController::class, 'store'])->name('message.store');
    Route::delete('/message/{message}', [MessageController::class, 'destroy'])->name('message.destroy');
    Route::get('/message/older/{message}', [MessageController::class, 'loadOlder'])->name('message.loadOlder');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
