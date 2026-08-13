<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\Product;
use App\Models\ProductImage;

class AdminProductsController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');
        $category = $request->query('category');
        $stock = $request->query('stock'); // low, out
        $perPage = (int)$request->query('per_page', 20);

        $query = Product::query();

        if ($q) {
            $query->where(function($s) use ($q) { $s->where('name','like','%'.$q.'%')->orWhere('sku','like','%'.$q.'%'); });
        }
        if ($category) $query->where('category_id', $category);
        if ($stock === 'low') $query->where('stock_qty', '<=', 5);
        if ($stock === 'out') $query->where('stock_qty', '<=', 0);

        $data = $query->with('images')->orderBy('created_at','desc')->paginate($perPage);
        return response()->json($data);
    }

    public function destroy(Request $request, $id)
    {
        $product = Product::with('images')->findOrFail($id);

        // delete images files
        foreach ($product->images as $img) {
            if ($img->path && Storage::disk('public')->exists($img->path)) {
                Storage::disk('public')->delete($img->path);
            }
            $img->delete();
        }

        $product->delete();
        return response()->json(['deleted' => true]);
    }

    // Replace image: accepts image and optional is_primary; will upload and mark primary if needed
    public function replaceImage(Request $request, $id, $imageId)
    {
        $product = Product::findOrFail($id);
        $image = ProductImage::where('product_id',$id)->where('id',$imageId)->firstOrFail();

        $v = Validator::make($request->all(), ['image' => 'required|image|max:5120','is_primary' => 'sometimes|boolean']);
        if ($v->fails()) return response()->json(['errors'=>$v->errors()],422);

        // delete old file
        if ($image->path && Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }

        $file = $request->file('image');
        $sku = $product->sku ?? 'product_'.$product->id;
        $path = "products/{$sku}";
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $storedPath = $file->storeAs($path, $filename, 'public');
        $url = Storage::disk('public')->url($storedPath);

        $image->path = $storedPath;
        $image->url = $url;
        $image->is_primary = $request->boolean('is_primary', $image->is_primary);
        $image->save();

        if ($image->is_primary) {
            ProductImage::where('product_id',$id)->where('id','!=',$image->id)->update(['is_primary'=>false]);
        }

        return response()->json($image);
    }

    // Delete a specific image
    public function deleteImage(Request $request, $id, $imageId)
    {
        $product = Product::findOrFail($id);
        $image = ProductImage::where('product_id',$id)->where('id',$imageId)->firstOrFail();
        if ($image->path && Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }
        $image->delete();
        return response()->json(['deleted' => true]);
    }
}
