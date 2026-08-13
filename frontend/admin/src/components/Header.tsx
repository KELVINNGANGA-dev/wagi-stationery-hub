import React from 'react'
import { useAuth } from '../auth'

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <img src="/logo192.png" alt="WAGI" className="h-10 inline-block mr-3" />
        <span className="text-lg font-semibold">WAGI - STATIONARIES Admin</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm">{user?.name}</div>
        <button className="px-3 py-1 border rounded" onClick={() => logout()}>Logout</button>
      </div>
    </header>
  )
}
