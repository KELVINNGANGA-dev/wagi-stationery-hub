import React, { useEffect, useState } from 'react'
import api from '../api'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // The backend must expose an admin stats endpoint /api/admin/stats (if not present, this will 404)
      const res = await api.get('/api/admin/stats')
      setStats(res.data)
    } catch (e) {
      // fallback: fetch counts individually
      setStats({ message: 'Stats endpoint not configured on backend' })
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Header />
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded shadow">{JSON.stringify(stats)}</div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  )
}
