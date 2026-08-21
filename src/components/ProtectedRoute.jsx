import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Guards student-only authenticated routes
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isStudent } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    )
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!isStudent) {
    return <Navigate to="/admin" replace />
  }
  return children
}
