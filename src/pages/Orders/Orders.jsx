import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Navigation from '../../components/common/Navigation'
import orderService from '../../services/orderService'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (user) {
      fetchUserOrders()
      fetchUserStats()
    }
  }, [user])

  const fetchUserOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: ordersData, error: ordersError } = await orderService.getUserOrders(user.id)

      if (ordersError) {
        throw new Error(ordersError)
      }

      setOrders(ordersData || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Gagal memuat pesanan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const { data: statsData, error: statsError } = await orderService.getUserOrderStats(user.id)
      
      if (statsError) {
        throw new Error(statsError)
      }

      setStats(statsData)
    } catch (err) {
      console.error('Error fetching stats:', err)
      // Don't show error for stats, just log it
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      return
    }

    try {
      const { error } = await orderService.cancelOrder(orderId, user.id)
      
      if (error) {
        throw new Error(error)
      }

      // Refresh orders and stats after cancellation
      await fetchUserOrders()
      await fetchUserStats()
      alert('Pesanan berhasil dibatalkan')
    } catch (err) {
      console.error('Error cancelling order:', err)
      alert(err.message || 'Gagal membatalkan pesanan')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Konfirmasi'
      case 'processing':
        return 'Sedang Diproses'
      case 'shipped':
        return 'Sedang Dikirim'
      case 'delivered':
        return 'Selesai'
      case 'cancelled':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Pembayaran'
      case 'paid':
        return 'Sudah Dibayar'
      case 'failed':
        return 'Gagal'
      case 'refunded':
        return 'Dikembalikan'
      default:
        return status
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat pesanan...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pesanan Saya
          </h1>
          <p className="mt-2 text-gray-600">
            Riwayat dan status pesanan Anda
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📦</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Pesanan</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">💰</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Belanja</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">⏳</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✅</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Selesai</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.completedOrders}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-400 mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada pesanan
            </h3>
            <p className="text-gray-600 mb-6">
              Anda belum memiliki pesanan apapun. Mulai berbelanja sekarang!
            </p>
            <button
              onClick={() => window.location.href = '/catalog'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Mulai Berbelanja
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                                         <div className="flex flex-col items-end space-y-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                         {getStatusText(order.status)}
                       </span>
                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                         {getPaymentStatusText(order.payment_status)}
                       </span>
                       {order.status === 'pending' && (
                         <button
                           onClick={() => handleCancelOrder(order.id)}
                           className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                         >
                           Batalkan Pesanan
                         </button>
                       )}
                     </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.product_name}
                          </h4>
                          {item.variant_name && (
                            <p className="text-sm text-gray-600">
                              Varian: {item.variant_name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            Jumlah: {item.quantity} x {formatCurrency(item.price)}
                          </p>
                          
                          {/* Photo Status */}
                          {item.order_photos && item.order_photos.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                Foto: {item.order_photos.length} file
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.order_photos.map((photo) => (
                                  <span 
                                    key={photo.id}
                                    className={`px-2 py-1 rounded text-xs ${
                                      photo.upload_status === 'completed' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    {photo.file_name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Alamat: {order.shipping_address?.address || 'Tidak tersedia'}
                      </p>
                      {order.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          Catatan: {order.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders 