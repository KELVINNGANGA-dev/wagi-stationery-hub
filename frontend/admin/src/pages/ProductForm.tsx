import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function ProductForm() {
  const { id } = useParams()
  const editMode = !!id
  const nav = useNavigate()

  const [form, setForm] = useState<any>({ name: '', sku: '', price: 0, stock_qty: 0, description: '' })
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editMode) fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    const res = await api.get(`/api/products/${id}`)
    setForm(res.data)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (editMode) {
        await api.put(`/api/admin/products/${id}`, form)
      } else {
        const res = await api.post('/api/admin/products', form)
        if (res.data && res.data.id) {
          nav(`/products/${res.data.id}/edit`)
        }
      }
      if (image && editMode) {
        const fd = new FormData()
        fd.append('image', image)
        await api.post(`/api/admin/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      alert('Saved')
    } catch (e: any) {
      alert('Save failed: ' + (e?.response?.data?.message || e.message))
    } finally { setLoading(false) }
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
          <label className="block mb-2">SKU</label>
          <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full border p-2 rounded mb-3" />
          <label className="block mb-2">Price (KES)</label>
          <input type="number" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="w-full border p-2 rounded mb-3" />
          <label className="block mb-2">Stock Quantity</label>
          <input type="number" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: parseInt(e.target.value)})} className="w-full border p-2 rounded mb-3" />
          <label className="block mb-2">Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 rounded mb-3" />

          <label className="block mb-2">Upload Primary Image</label>
          <input type="file" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} className="mb-3" />

          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <button onClick={() => nav('/products')} className="px-4 py-2 rounded border">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
