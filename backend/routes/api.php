<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminStatsController;
use App\Http\Controllers\Admin\AdminCustomersController;
use App\Http\Controllers\Admin\AdminCategoriesController;
use App\Http\Controllers\Admin\AdminProductsController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\AdminPaymentsController;
use App\Http\Controllers\Admin\AdminReportsController;
use App\Http\Controllers\Admin\AdminNotificationsController;

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
    // Stats
    Route::get('/stats', [AdminStatsController::class, 'index']);

    // Customers
    Route::get('/customers', [AdminCustomersController::class, 'index']);
    Route::get('/customers/{id}', [AdminCustomersController::class, 'show']);
    Route::put('/customers/{id}', [AdminCustomersController::class, 'update']);
    Route::delete('/customers/{id}', [AdminCustomersController::class, 'destroy']);

    // Categories
    Route::get('/categories', [AdminCategoriesController::class, 'index']);
    Route::post('/categories', [AdminCategoriesController::class, 'store']);
    Route::put('/categories/{id}', [AdminCategoriesController::class, 'update']);
    Route::delete('/categories/{id}', [AdminCategoriesController::class, 'destroy']);

    // Products (admin)
    Route::get('/products', [AdminProductsController::class, 'index']);
    Route::delete('/products/{id}', [AdminProductsController::class, 'destroy']);
    Route::post('/products/{id}/images/{imageId}/replace', [AdminProductsController::class, 'replaceImage']);
    Route::delete('/products/{id}/images/{imageId}', [AdminProductsController::class, 'deleteImage']);

    // Inventory
    Route::post('/inventory/adjust', [InventoryController::class, 'adjust']);
    Route::get('/inventory/low', [InventoryController::class, 'lowStock']);

    // Payments
    Route::get('/payments', [AdminPaymentsController::class, 'index']);
    Route::post('/payments/{id}/status', [AdminPaymentsController::class, 'updateStatus']);

    // Reports
    Route::get('/reports/daily-sales', [AdminReportsController::class, 'dailySales']);
    Route::get('/reports/monthly-sales', [AdminReportsController::class, 'monthlySales']);

    // Notifications
    Route::get('/notifications', [AdminNotificationsController::class, 'index']);
    Route::post('/notifications/{id}/read', [AdminNotificationsController::class, 'markRead']);

    // Orders
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::post('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
});
