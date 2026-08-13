import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold">WAGI Admin</h1>
        <div className="text-sm text-gray-600">{user?.email}</div>
      </div>
      <nav className="flex flex-col gap-2">
        <Link to="/" className="text-gray-700">Dashboard</Link>
        <Link to="/products" className="text-gray-700">Products</Link>
        <Link to="/orders" className="text-gray-700">Orders</Link>
        <Link to="#" className="text-gray-700">Customers</Link>
        <Link to="#" className="text-gray-700">Reports</Link>
        <Link to="#" className="text-gray-700">Settings</Link>
      </nav>
    </aside>
  )
}
