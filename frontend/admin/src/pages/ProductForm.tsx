import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function ProductForm() {
  const { id } = useParams()
  const editMode = !!id
  const nav = useNavigate()

  const [form, setForm] = useState<any>({ name: '', sku: '', price: 0, stock_qty: 0, description: '', category_id: null })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [images, setImages] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (editMode) fetchProduct()
  }, [id])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/admin/categories')
      setCategories(res.data.data || res.data)
    } catch (e) { console.error(e) }
  }

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/api/products/${id}`)
      setForm(res.data)
      setImages(res.data.images || [])
    } catch (e) { console.error(e) }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      let prod
      if (editMode) {
        const res = await api.put(`/api/admin/products/${id}`, form)
        prod = res.data
      } else {
        const res = await api.post('/api/admin/products', form)
        prod = res.data
        nav(`/products/${prod.id}/edit`)
      }

      // If new image file selected, upload
      if (imageFile && prod?.id) {
        const fd = new FormData()
        fd.append('image', imageFile)
        const res = await api.post(`/api/admin/products/${prod.id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        // refresh images
        setImages(prev => [...prev, res.data])
      }

      alert('Saved')
    } catch (e: any) {
      alert('Save failed: ' + (e?.response?.data?.message || JSON.stringify(e?.response?.data?.errors) || e.message))
    } finally { setLoading(false) }
  }

  const handleReplaceImage = async (imageId: number) => {
    const file = prompt('Replace with a new image: please select a file using the file input above and then press OK to upload. (This is a simple flow due to the inline demo)')
    // In a real UI you would open a file picker per image. Here we assume imageFile is set.
    if (!imageFile) return alert('Please select a file in the "Upload Primary Image" input first')
    try {
      const fd = new FormData()
      fd.append('image', imageFile)
      const res = await api.post(`/api/admin/products/${id}/images/${imageId}/replace`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      // update images
      setImages(images.map(img => img.id === res.data.id ? res.data : img))
      alert('Image replaced')
    } catch (e:any) { alert('Replace failed: '+(e?.response?.data?.message || e.message)) }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Delete this image?')) return
    try {
      await api.delete(`/api/admin/products/${id}/images/${imageId}`)
      setImages(images.filter(i => i.id !== imageId))
    } catch (e:any) { alert('Delete failed: '+(e?.response?.data?.message || e.message)) }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Header />
        <h2 className="text-2xl font-semibold mb-4">{editMode ? 'Edit Product' : 'Add Product'}</h2>
        <div className="bg-white p-4 rounded shadow max-w-2xl">
          <label className="block mb-2">Name</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded mb-3" />

          <label className="block mb-2">Category</label>
          <select value={form.category_id || ''} onChange={e => setForm({...form, category_id: e.target.value || null})} className="w-full border p-2 rounded mb-3">
            <option value="">Uncategorized</option>
            {categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <label className="block mb-2">SKU</label>
          <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full border p-2 rounded mb-3" />
          <label className="block mb-2">Price (KES)</label>
          <input type="number" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="w-full border p-2 rounded mb-3" />
          <label className="block mb-2">Stock Quantity</label>
          <input type="number" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: parseInt(e.target.value)})} className="w-full border p-2 rounded mb-3" />
          <label className="block mb-2">Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 rounded mb-3" />

          <label className="block mb-2">Upload Primary Image</label>
          <input type="file" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="mb-3" />

          <div className="mb-3">
            <h4 className="font-semibold">Existing Images</h4>
            <div className="flex gap-2 mt-2">
              {images.map(img => (
                <div key={img.id} className="w-32">
                  <img src={img.url} alt={img.alt} className="w-32 h-20 object-cover rounded" />
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => handleReplaceImage(img.id)} className="text-sm px-2 py-1 bg-yellow-500 text-white rounded">Replace</button>
                    <button onClick={() => handleDeleteImage(img.id)} className="text-sm px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <button onClick={() => nav('/products')} className="px-4 py-2 rounded border">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
