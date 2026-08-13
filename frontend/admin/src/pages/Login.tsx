import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const auth = useAuth()
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await auth.login(email, password)
      nav('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">WAGI - Admin Login</h1>
        <form onSubmit={submit}>
          <label className="block mb-2">Email</label>
          <input className="w-full border p-2 rounded mb-3" value={email} onChange={e => setEmail(e.target.value)} />
          <label className="block mb-2">Password</label>
          <input type="password" className="w-full border p-2 rounded mb-3" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
        </form>
      </div>
    </div>
  )
}
