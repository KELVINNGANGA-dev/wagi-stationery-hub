import React, { useEffect, useState } from 'react'
import api from '../api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Link } from 'react-router-dom'

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/products')
      setProducts(res.data.data || res.data)
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Header />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Products</h2>
          <Link to="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded">Add Product</Link>
        </div>
        <div className="bg-white rounded shadow p-4">
          {loading ? <div>Loading...</div> : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">SKU</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{p.id}</td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.sku}</td>
                    <td className="p-2">KES {p.price}</td>
                    <td className="p-2">{p.stock_qty}</td>
                    <td className="p-2">
                      <Link to={`/products/${p.id}/edit`} className="text-blue-600 mr-2">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
