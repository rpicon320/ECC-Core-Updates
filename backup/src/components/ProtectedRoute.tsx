import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireStaff?: boolean
  requireClient?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireStaff = false,
  requireClient = false 
}: ProtectedRouteProps) {
  const { user, userType, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  if (requireAdmin && (userType !== 'staff' || (user as any).role !== 'admin')) {
    return <Navigate to="/client-portal" replace />
  }

  if (requireStaff && userType !== 'staff') {
    return <Navigate to="/client-portal" replace />
  }

  if (requireClient && userType !== 'client') {
    return <Navigate to="/clients" replace />
  }

  // Redirect clients to their portal
  if (userType === 'client' && !requireClient) {
    return <Navigate to="/client-portal" replace />
  }

  return <>{children}</>
}