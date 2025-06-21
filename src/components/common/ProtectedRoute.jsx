import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userProfile, loading } = useAuth()
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    // Show timeout message if loading takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('ProtectedRoute: Loading timeout reached')
        setShowTimeout(true)
      }
    }, 10000) // Reduced to 10 seconds since auth loading should be faster now

    return () => clearTimeout(timeoutId)
  }, [loading])

  // Reset timeout message when loading changes
  useEffect(() => {
    if (!loading) {
      setShowTimeout(false)
    }
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
          <div className="text-lg text-gray-600">Memuat autentikasi...</div>
          {showTimeout && (
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">Loading memakan waktu lebih lama...</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Refresh Halaman
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Check role if required
  if (requiredRole && userProfile) {
    if (userProfile.role !== requiredRole) {
      console.log('ProtectedRoute: Insufficient permissions, redirecting to home')
      return <Navigate to="/home" replace />
    }
  }

  // Show access denied for admin routes if no profile or insufficient permissions
  if (requiredRole === 'admin' && (!userProfile || userProfile.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-red-500 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-4">Anda tidak memiliki izin untuk mengakses halaman admin.</p>
          <button
            onClick={() => window.location.href = '/home'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  console.log('ProtectedRoute: User authenticated, showing protected content')
  return children
}

export default ProtectedRoute 