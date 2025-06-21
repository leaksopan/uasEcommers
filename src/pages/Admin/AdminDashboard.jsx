import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import adminService from '../../services/adminService'

const AdminDashboard = () => {
  const { userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalPhotos: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const statsData = await adminService.stats.getDashboard()
        setStats(statsData)
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
        setError('Gagal memuat statistik dashboard. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardStats()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error during logout:', error)
      alert('Gagal logout. Silakan coba lagi.')
    }
  }

  const statsCards = [
    {
      title: 'Total Produk',
      value: stats.totalProducts,
      icon: '📦',
      color: 'bg-blue-500',
      link: '/admin/products'
    },
    {
      title: 'Total Pesanan',
      value: stats.totalOrders,
      icon: '🛒',
      color: 'bg-green-500',
      link: '/admin/orders'
    },
    {
      title: 'Pesanan Pending',
      value: stats.pendingOrders,
      icon: '⏳',
      color: 'bg-yellow-500',
      link: '/admin/orders?status=pending'
    },
    {
      title: 'Sedang Diproses',
      value: stats.processingOrders,
      icon: '⚙️',
      color: 'bg-purple-500',
      link: '/admin/orders?status=processing'
    },
    {
      title: 'Pesanan Selesai',
      value: stats.completedOrders,
      icon: '✅',
      color: 'bg-green-600',
      link: '/admin/orders?status=delivered'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: '💰',
      color: 'bg-emerald-500',
      link: '/admin/orders'
    },
    {
      title: 'Total Foto',
      value: stats.totalPhotos,
      icon: '📸',
      color: 'bg-pink-500',
      link: '/admin/orders'
    },
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-indigo-500',
      link: '/admin/users'
    }
  ]

  const quickActions = [
    {
      title: 'Kelola Produk',
      description: 'Tambah, edit, atau hapus produk',
      icon: '📦',
      color: 'bg-blue-500 hover:bg-blue-600',
      link: '/admin/products'
    },
    {
      title: 'Kelola Pesanan',
      description: 'Lihat dan proses pesanan masuk',
      icon: '🛒',
      color: 'bg-green-500 hover:bg-green-600',
      link: '/admin/orders'
    },
    {
      title: 'Pesanan Baru',
      description: `${stats.pendingOrders} pesanan perlu diproses`,
      icon: '🔔',
      color: 'bg-red-500 hover:bg-red-600',
      link: '/admin/orders?status=pending'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
          <div className="text-lg text-gray-600">Memuat dashboard...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-gray-600">Selamat datang, {userProfile?.full_name || 'Admin'}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Logout dari admin panel"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600">Selamat datang, {userProfile?.full_name || 'Admin'}</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                🏠 Beranda
              </Link>
              <Link
                to="/admin/products"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                📦 Kelola Produk
              </Link>
              <Link
                to="/admin/orders"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                🛒 Kelola Pesanan
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Logout dari admin panel"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} rounded-md p-3`}>
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Aksi Cepat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`${action.color} text-white p-6 rounded-lg transition-colors`}
                >
                  <div className="flex items-center">
                    <span className="text-3xl mr-4">{action.icon}</span>
                    <div>
                      <h4 className="text-lg font-semibold">{action.title}</h4>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg mt-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Ringkasan Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-500 text-white">
                    <span className="text-xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Produk Aktif</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-500 text-white">
                    <span className="text-xl">🛒</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Pesanan</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-500 text-white">
                    <span className="text-xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-pink-500 text-white">
                    <span className="text-xl">📸</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Foto Upload</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalPhotos}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 