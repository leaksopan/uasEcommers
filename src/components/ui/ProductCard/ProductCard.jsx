import { formatPrice, getMainImage, hasDiscount, getDiscountPercentage } from '../../../services/productService.jsx'

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const mainImage = getMainImage(product)
  const showDiscount = hasDiscount(product)
  const discountPercentage = getDiscountPercentage(product)
  const hasMultipleImages = product.images && product.images.length > 1

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleViewDetails()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'
          }}
        />
        
        {/* Image Count Indicator */}
        {hasMultipleImages && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>{product.images.length}</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {showDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
            -{discountPercentage}%
          </div>
        )}

        {/* Featured Badge */}
        {product.is_featured && (
          <div className={`absolute ${showDiscount ? 'top-12 right-2' : 'top-2 right-2'} bg-amber-500 text-white px-2 py-1 rounded-md text-sm font-medium`}>
            Unggulan
          </div>
        )}

        {/* Stock Badge */}
        {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
          <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs">
            Stok Terbatas
          </div>
        )}

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium bg-red-600 px-3 py-1 rounded-md">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-sm text-gray-500 mb-1">
          {product.product_categories?.name}
        </p>

        {/* Product Name */}
        <h3 
          className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={handleViewDetails}
          onKeyDown={handleKeyDown}
          tabIndex="0"
          role="button"
          aria-label={`Lihat detail ${product.name}`}
        >
          {product.name}
        </h3>

        {/* Short Description */}
        {product.short_description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {showDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Stock Info */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Stok: {product.stock_quantity}
          </span>
          {product.min_order_quantity > 1 && (
            <span className="text-xs text-gray-500">
              Min. {product.min_order_quantity} pcs
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            aria-label={`Lihat detail ${product.name}`}
          >
            Lihat Detail
          </button>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              product.stock_quantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
            }`}
            aria-label={product.stock_quantity === 0 ? 'Stok habis' : `Tambah ${product.name} ke keranjang`}
          >
            {product.stock_quantity === 0 ? 'Stok Habis' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard 