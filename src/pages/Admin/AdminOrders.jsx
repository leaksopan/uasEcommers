import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [downloadingPhotos, setDownloadingPhotos] = useState(false)
  const [error, setError] = useState(null)

  const orderStatuses = [
    { value: 'all', label: 'Semua Status', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Diproses', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Selesai', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const ordersData = await adminService.orders.getAll()
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading orders:', error)
      setError('Gagal memuat data pesanan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const loadOrderDetails = async (orderId) => {
    try {
      setError(null)
      const orderDetail = await adminService.orders.getById(orderId)
      setSelectedOrder(orderDetail)
      setShowOrderModal(true)
    } catch (error) {
      console.error('Error loading order details:', error)
      setError('Gagal memuat detail pesanan.')
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setError(null)
      await adminService.orders.updateStatus(orderId, newStatus)
      
      // Update orders list
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ))
      
      // Update selected order if it's the same
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }))
      }
      
      alert(`Status pesanan berhasil diubah ke ${getStatusLabel(newStatus)}`)
    } catch (error) {
      console.error('Error updating order status:', error)
      setError('Terjadi kesalahan saat mengubah status pesanan')
    }
  }

  const handleDownloadPhoto = async (photo) => {
    try {
      setError(null)
      await adminService.photos.download(photo.file_path, photo.file_name)
      alert(`Foto ${photo.file_name} berhasil didownload`)
    } catch (error) {
      console.error('Error downloading photo:', error)
      setError('Terjadi kesalahan saat mendownload foto')
    }
  }

  const handleDownloadAllPhotos = async (orderItem) => {
    try {
      setDownloadingPhotos(true)
      setError(null)
      
      if (!orderItem.order_photos || orderItem.order_photos.length === 0) {
        alert('Tidak ada foto untuk didownload')
        return
      }

      for (const photo of orderItem.order_photos) {
        await adminService.photos.download(photo.file_path, photo.file_name)
        // Add delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      alert(`Semua foto (${orderItem.order_photos.length}) berhasil didownload`)
    } catch (error) {
      console.error('Error downloading all photos:', error)
      setError('Terjadi kesalahan saat mendownload semua foto')
    } finally {
      setDownloadingPhotos(false)
    }
  }

  const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(numAmount || 0)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status) => {
    return orderStatuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    return orderStatuses.find(s => s.value === status)?.label || status
  }

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  const getPhotoUrl = (filePath) => {
    return adminService.photos.getUrl(filePath)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link to="/admin" className="text-gray-500 hover:text-gray-700 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Kelola Pesanan</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
            <div className="flex items-center">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Pesanan</h1>
            </div>
            <button
              onClick={loadOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-2">
            {orderStatuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status.value
                    ? status.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.label}
                {status.value !== 'all' && (
                  <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {orders.filter(order => order.status === status.value).length}
                  </span>
                )}
                {status.value === 'all' && (
                  <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {orders.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pesanan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items/Foto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">Tidak ada pesanan</p>
                        <p className="text-gray-500">
                          {statusFilter === 'all' 
                            ? 'Belum ada pesanan masuk'
                            : `Tidak ada pesanan dengan status ${getStatusLabel(statusFilter)}`
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.order_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.payment_method?.toUpperCase() || 'COD'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer_email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {order.item_count}
                        </div>
                        <div className="flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {order.photo_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => loadOrderDetails(order.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Detail
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Diproses</option>
                            <option value="shipped">Dikirim</option>
                            <option value="delivered">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Detail Pesanan {selectedOrder.order_number}
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Informasi Pelanggan</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nama:</span> {selectedOrder.customer_name}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                  <p><span className="font-medium">Telepon:</span> {selectedOrder.customer_phone}</p>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Alamat Pengiriman</h4>
                <div className="text-sm">
                  <p>{selectedOrder.shipping_address?.address}</p>
                  <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.province}</p>
                  <p>{selectedOrder.shipping_address?.postal_code}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Item Pesanan</h4>
              <div className="space-y-4">
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {item.product_name}
                          {item.variant_name && (
                            <span className="text-gray-500 ml-2">({item.variant_name})</span>
                          )}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                      {item.order_photos && item.order_photos.length > 0 && (
                        <button
                          onClick={() => handleDownloadAllPhotos(item)}
                          disabled={downloadingPhotos}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          {downloadingPhotos ? 'Downloading...' : `Download Semua (${item.order_photos.length})`}
                        </button>
                      )}
                    </div>

                    {/* Photos */}
                    {item.order_photos && item.order_photos.length > 0 && (
                      <div>
                        <h6 className="font-medium text-gray-900 mb-2">
                          Foto ({item.order_photos.length})
                        </h6>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {item.order_photos.map((photo) => (
                            <div key={photo.id} className="bg-gray-100 rounded-lg p-3">
                              <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                                <img
                                  src={getPhotoUrl(photo.file_path)}
                                  alt={photo.file_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/api/placeholder/150/150'
                                  }}
                                />
                              </div>
                              <div className="text-xs text-gray-600">
                                <p className="truncate" title={photo.file_name}>
                                  {photo.file_name}
                                </p>
                                <p>{formatFileSize(photo.file_size)}</p>
                              </div>
                              <button
                                onClick={() => handleDownloadPhoto(photo)}
                                className="w-full mt-2 bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300"
                              >
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Ringkasan Pesanan</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Pengiriman:</span>
                  <span>{formatCurrency(selectedOrder.shipping_fee)}</span>
                </div>
                {selectedOrder.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak:</span>
                    <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                  </div>
                )}
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon:</span>
                    <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Catatan</h4>
                <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders 