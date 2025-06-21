import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/common/Navigation'
import { useCart } from '../../contexts/CartContext'
import { formatPrice, getMainImage } from '../../services/productService'

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [loading, setLoading] = useState(false)
  const mainImage = getMainImage(item.product)

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return
    
    setLoading(true)
    try {
      await onUpdateQuantity(item.id, newQuantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      await onRemove(item.id)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={mainImage}
            alt={item.product.name}
            className="w-20 h-20 object-cover rounded-md"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {item.product.name}
          </h3>
          {item.variant && (
            <p className="text-sm text-gray-500 mt-1">
              Varian: {item.variant.name}
            </p>
          )}
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {formatPrice(item.price)}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={loading || item.quantity <= 1}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Kurangi jumlah"
          >
            -
          </button>
          
          <span className="w-12 text-center font-medium">
            {item.quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={loading}
          className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Hapus dari keranjang"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

const Cart = () => {
  const navigate = useNavigate()
  const { 
    items, 
    loading, 
    error, 
    totalItems, 
    totalPrice, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
  } = useCart()

  const handleClearCart = async () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
      try {
        await clearCart()
      } catch (error) {
        alert('Gagal mengosongkan keranjang')
      }
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Keranjang kosong')
      return
    }
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat keranjang...</p>
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
            Keranjang Belanja
          </h1>
          <p className="mt-2 text-gray-600">
            {totalItems} item dalam keranjang
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

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Keranjang Anda Kosong
              </h2>
              <p className="text-gray-600 mb-8">
                Belum ada produk dalam keranjang. Mulai berbelanja sekarang!
              </p>
              <button
                onClick={() => navigate('/catalog')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Mulai Berbelanja
              </button>
            </div>
          </div>
        ) : (
          /* Cart Items */
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-8">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateCartItem}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="mt-6">
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md px-3 py-2"
                >
                  Kosongkan Keranjang
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ringkasan Pesanan
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} item)</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkos Kirim</span>
                    <span className="font-medium">Dihitung saat checkout</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Lanjut ke Checkout
                </button>

                <button
                  onClick={() => navigate('/catalog')}
                  className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Lanjut Berbelanja
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart 