import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

const Navigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()
  const { totalItems } = useCart()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const navigationItems = [
    { path: '/home', label: 'Beranda', icon: '🏠' },
    { path: '/catalog', label: 'Katalog', icon: '🛍️' },
    { path: '/orders', label: 'Pesanan', icon: '📋' },
  ]

  const isCurrentPath = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/home')}
              className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md px-2 py-1"
              aria-label="Kembali ke beranda"
            >
              📸 PhotoBox
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isCurrentPath(item.path)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                }`}
                aria-label={`Navigasi ke ${item.label}`}
                aria-current={isCurrentPath(item.path) ? 'page' : undefined}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}

            {/* Cart Button */}
            <button
              onClick={() => navigate('/cart')}
              className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isCurrentPath('/cart')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
              }`}
              aria-label="Lihat keranjang belanja"
              aria-current={isCurrentPath('/cart') ? 'page' : undefined}
            >
              <span className="mr-1">🛒</span>
              Keranjang
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Keluar dari akun"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 