<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Admin-only routes (apply auth:sanctum and admin middleware in real app)
Route::post('/admin/products', [ProductController::class, 'store']);
Route::put('/admin/products/{id}', [ProductController::class, 'update']);
Route::post('/admin/products/{id}/images', [ProductController::class, 'uploadImage']);
Route::delete('/admin/products/{id}/images/{imageId}', [ProductController::class, 'deleteImage']);
