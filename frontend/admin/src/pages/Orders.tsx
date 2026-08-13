import React, { useEffect, useState } from 'react'
import api from '../api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/admin/orders')
      setOrders(res.data.data || res.data)
    } catch (e) { console.error(e) }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.post(`/api/admin/orders/${id}/status`, { status })
      fetchOrders()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Header />
        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
        <div className="bg-white rounded shadow p-4">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left">
                <th className="p-2">Order #</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Total</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="p-2">{o.order_number}</td>
                  <td className="p-2">{o.user?.name || o.user_id}</td>
                  <td className="p-2">KES {o.total}</td>
                  <td className="p-2">{o.payment_method} / {o.payment_status}</td>
                  <td className="p-2">{o.status}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(o.id, 'approved')} className="px-2 py-1 bg-green-600 text-white rounded">Approve</button>
                      <button onClick={() => updateStatus(o.id, 'processing')} className="px-2 py-1 bg-yellow-600 text-white rounded">Process</button>
                      <button onClick={() => updateStatus(o.id, 'shipped')} className="px-2 py-1 bg-blue-600 text-white rounded">Ship</button>
                      <button onClick={() => updateStatus(o.id, 'delivered')} className="px-2 py-1 bg-gray-800 text-white rounded">Deliver</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
