import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <div className="p-6">Forbidden</div>
  return <>{children}</>
}

export default ProtectedRoute
