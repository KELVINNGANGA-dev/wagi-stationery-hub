---
*** Begin Patch
*** Update File: backend/routes/api.php
@@
     // Products (admin)
-    Route::get('/products', [AdminProductsController::class, 'index']);
-    Route::delete('/products/{id}', [AdminProductsController::class, 'destroy']);
+    Route::get('/products', [AdminProductsController::class, 'index']);
+    Route::post('/products', [AdminProductsController::class, 'store']);
+    Route::put('/products/{id}', [AdminProductsController::class, 'update']);
+    Route::delete('/products/{id}', [AdminProductsController::class, 'destroy']);
     Route::post('/products/{id}/images/{imageId}/replace', [AdminProductsController::class, 'replaceImage']);
     Route::delete('/products/{id}/images/{imageId}', [AdminProductsController::class, 'deleteImage']);
+
+    // Image upload for adding new images to product (uses ProductController::uploadImage)
+    Route::post('/products/{id}/images', [\App\Http\Controllers\ProductController::class, 'uploadImage']);
*** End Patch
