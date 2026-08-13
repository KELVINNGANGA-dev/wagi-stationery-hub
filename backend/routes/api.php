<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AdminOrderController;

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Authentication (customers and admins)
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
Route::post('/auth/change-password', [AuthController::class, 'changePassword'])->middleware(['auth:sanctum','throttle:5,1']);

// Password reset
Route::post('/password/forgot', [PasswordResetController::class, 'forgot'])->middleware('throttle:5,1');
Route::post('/password/reset', [PasswordResetController::class, 'reset'])->middleware('throttle:5,1');

// Cart (authenticated)
Route::middleware(['auth:sanctum','throttle:30,1'])->group(function () {
    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart', [CartController::class, 'add']);
    Route::put('/cart', [CartController::class, 'update']);
    Route::delete('/cart/{productId}', [CartController::class, 'remove']);

    // Checkout & orders
    Route::post('/checkout', [CheckoutController::class, 'checkout']);
    Route::get('/orders', [CheckoutController::class, 'orders']);
    Route::get('/orders/{id}', [CheckoutController::class, 'show']);
});

// Admin routes
Route::prefix('admin')->middleware(['auth:sanctum','admin'])->group(function () {
    // Protect admin UI routes (rendered by frontend) - these routes return JSON for dashboard
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::post('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
});
