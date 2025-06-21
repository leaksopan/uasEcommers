import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/common/Navigation'
import PhotoUpload from '../../components/ui/PhotoUpload/PhotoUpload'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatPrice, getMainImage } from '../../services/productService'
import { supabase } from '../../services/supabase'

const OrderItem = ({ item, orderItemId = null, onPhotoUpload = () => {} }) => {
  const mainImage = getMainImage(item.product)

  const handlePhotoUploadComplete = (files) => {
    onPhotoUpload(item.id, files)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Product Info */}
      <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
        <img
          src={mainImage}
          alt={item.product.name}
          className="w-16 h-16 object-cover rounded-md"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {item.product.name}
          </h4>
          {item.variant && (
            <p className="text-sm text-gray-500">
              Varian: {item.variant.name}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Qty: {item.quantity}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>

      {/* Photo Upload Section */}
      <PhotoUpload
        orderItemId={orderItemId}
        productName={item.product.name}
        variantName={item.variant?.name}
        maxFiles={item.quantity * 5} // 5 foto per quantity
        onUploadComplete={handlePhotoUploadComplete}
        onUploadError={(error) => console.error('Upload error for item:', item.id, error)}
      />
    </div>
  )
}

const Checkout = () => {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [photoUploads, setPhotoUploads] = useState({})
  const [formData, setFormData] = useState({
    // Customer Info
    customerName: '',
    customerEmail: user?.email || '',
    customerPhone: '',
    
    // Shipping Address
    address: '',
    city: '',
    province: '',
    postalCode: '',
    
    // Payment
    paymentMethod: 'transfer',
    
    // Notes
    notes: ''
  })

  const shippingFee = 15000 // Fixed shipping fee
  const totalAmount = totalPrice + shippingFee

  useEffect(() => {
    // Redirect jika keranjang kosong
    if (items.length === 0) {
      navigate('/cart')
      return
    }
  }, [items.length, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoUpload = (itemId, files) => {
    setPhotoUploads(prev => ({
      ...prev,
      [itemId]: files
    }))
  }

  const generateOrderNumber = () => {
    const date = new Date()
    const timestamp = date.getTime().toString().slice(-6)
    return `PB-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${timestamp}`
  }

  const validatePhotos = () => {
    // Check if all items that require photos have photos uploaded
    const itemsNeedingPhotos = items.filter(item => {
      // Assume photobox and cetak foto products need photos
      const productName = item.product.name.toLowerCase()
      return productName.includes('photobox') || productName.includes('cetak') || productName.includes('foto')
    })

    const missingPhotos = itemsNeedingPhotos.filter(item => {
      const uploads = photoUploads[item.id] || []
      return uploads.length === 0
    })

    if (missingPhotos.length > 0) {
      const productNames = missingPhotos.map(item => item.product.name).join(', ')
      alert(`Mohon upload foto untuk produk: ${productNames}`)
      return false
    }

    return true
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validasi form
      const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'address', 'city', 'province', 'postalCode']
      const missingFields = requiredFields.filter(field => !formData[field].trim())
      
      if (missingFields.length > 0) {
        alert('Mohon lengkapi semua field yang wajib diisi')
        setLoading(false)
        return
      }

      // Validasi foto
      if (!validatePhotos()) {
        setLoading(false)
        return
      }

      // Generate order number
      const orderNumber = generateOrderNumber()

      // Prepare order data
      const orderData = {
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        shipping_address: {
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postalCode
        },
        subtotal: totalPrice,
        shipping_fee: shippingFee,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: totalAmount,
        payment_method: formData.paymentMethod,
        payment_status: 'pending',
        notes: formData.notes || null,
        metadata: {
          created_from: 'web',
          user_agent: navigator.userAgent,
          photo_uploads: photoUploads
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product.name,
        variant_name: item.variant?.name || null,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        product_data: {
          images: item.product.images,
          sku: item.product.sku
        }
      }))

      const { data: createdOrderItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select()

      if (itemsError) throw itemsError

      // Save photo references to order_photos table
      const photoPromises = createdOrderItems.map(async (orderItem) => {
        const cartItem = items.find(item => 
          item.product_id === orderItem.product_id && 
          item.variant_id === orderItem.variant_id
        )
        
        if (cartItem && photoUploads[cartItem.id]) {
          const photoData = photoUploads[cartItem.id].map((photo, index) => ({
            order_item_id: orderItem.id,
            file_name: photo.fileName,
            file_path: photo.filePath,
            file_size: photo.fileSize,
            mime_type: photo.mimeType,
            upload_status: 'completed',
            sort_order: index,
            metadata: {
              uploaded_at_checkout: true,
              original_file_name: photo.fileName
            }
          }))

          const { error: photoError } = await supabase
            .from('order_photos')
            .insert(photoData)

          if (photoError) throw photoError
        }
      })

      await Promise.all(photoPromises)

      // Clear cart setelah berhasil
      await clearCart()

      // Show success and redirect
      alert(`Pesanan berhasil dibuat!\nNomor Pesanan: ${orderNumber}\n\nAnda akan dialihkan ke halaman beranda.`)
      navigate('/home')

    } catch (error) {
      console.error('Error creating order:', error)
      alert('Gagal membuat pesanan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>Mengalihkan ke keranjang...</p>
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
            Checkout
          </h1>
          <p className="mt-2 text-gray-600">
            Lengkapi informasi pesanan dan upload foto Anda
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmitOrder}>
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Photo Upload Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Upload Foto untuk Setiap Produk
                </h2>
                <div className="space-y-6">
                  {items.map((item) => (
                    <OrderItem 
                      key={item.id} 
                      item={item} 
                      onPhotoUpload={handlePhotoUpload}
                    />
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Informasi Pelanggan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon *
                    </label>
                    <input
                      type="tel"
                      id="customerPhone"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="customerEmail"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Alamat Pengiriman
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat Lengkap *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Jalan, nomor rumah, nama gedung, dll"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Kota *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Nama kota"
                      />
                    </div>
                    <div>
                      <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                        Provinsi *
                      </label>
                      <input
                        type="text"
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Nama provinsi"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Pos *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Metode Pembayaran
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={formData.paymentMethod === 'transfer'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Transfer Bank</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Cash on Delivery (COD)</span>
                  </label>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Catatan Tambahan
                </h2>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Catatan untuk penjual (opsional)"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ringkasan Pesanan
                </h2>

                {/* Order Items Summary */}
                <div className="space-y-2 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product.name} {item.variant?.name && `(${item.variant.name})`} x{item.quantity}
                      </span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkos Kirim</span>
                    <span className="font-medium">{formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Memproses...' : 'Buat Pesanan'}
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Kembali ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout 