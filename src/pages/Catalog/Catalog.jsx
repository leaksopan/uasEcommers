import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, getCategories, searchProducts } from '../../services/productService.jsx'
import ProductGrid from '../../components/ui/ProductGrid/ProductGrid.jsx'
import CategoryFilter from '../../components/ui/CategoryFilter/CategoryFilter.jsx'
import SearchBar from '../../components/ui/SearchBar/SearchBar.jsx'
import Navigation from '../../components/common/Navigation.jsx'
import { useCart } from '../../contexts/CartContext'

const Catalog = () => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  // State management
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        // Load categories and products in parallel
        const [categoriesResult, productsResult] = await Promise.all([
          getCategories(),
          getProducts({ sort_by: sortBy, sort_order: sortOrder })
        ])

        if (categoriesResult.error) {
          throw new Error(categoriesResult.error)
        }
        
        if (productsResult.error) {
          throw new Error(productsResult.error)
        }

        setCategories(categoriesResult.data || [])
        setProducts(productsResult.data || [])
        setError(null)
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err.message || 'Gagal memuat data produk')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [sortBy, sortOrder])

  // Load products when filters change
  useEffect(() => {
    const loadFilteredProducts = async () => {
      setLoading(true)
      try {
        const filters = {
          category_slug: selectedCategory,
          sort_by: sortBy,
          sort_order: sortOrder
        }

        let result
        if (searchTerm.trim()) {
          result = await searchProducts(searchTerm, filters)
        } else {
          result = await getProducts(filters)
        }

        if (result.error) {
          throw new Error(result.error)
        }

        setProducts(result.data || [])
        setError(null)
      } catch (err) {
        console.error('Error loading filtered products:', err)
        setError(err.message || 'Gagal memuat produk')
      } finally {
        setLoading(false)
      }
    }

    loadFilteredProducts()
  }, [selectedCategory, searchTerm, sortBy, sortOrder])

  // Handler functions
  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleSortChange = (event) => {
    const [newSortBy, newSortOrder] = event.target.value.split('-')
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product)
      alert(`${product.name} ditambahkan ke keranjang!`)
    } catch (error) {
      alert(error.message || 'Gagal menambahkan ke keranjang')
    }
  }

  const handleViewDetails = (product) => {
    // Navigate to product detail page
    navigate(`/product/${product.slug}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Katalog Produk
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Photobox & Cetak Foto Berkualitas Tinggi
            </p>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Cari produk photobox, cetak foto..."
              initialValue={searchTerm}
            />

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Urutkan:
              </label>
              <select
                id="sort"
                value={`${sortBy}-${sortOrder}`}
                onChange={handleSortChange}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="created_at-desc">Terbaru</option>
                <option value="created_at-asc">Terlama</option>
                <option value="name-asc">Nama A-Z</option>
                <option value="name-desc">Nama Z-A</option>
                <option value="price-asc">Harga Termurah</option>
                <option value="price-desc">Harga Termahal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />

              {/* Filter Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Hasil Pencarian
                </h4>
                <p className="text-sm text-gray-600">
                  {loading ? 'Memuat...' : `${products.length} produk ditemukan`}
                </p>
                
                {/* Active Filters */}
                {searchTerm && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      "{searchTerm}"
                      <button
                        onClick={() => handleSearch('')}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200 focus:outline-none"
                        aria-label="Hapus filter pencarian"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                )}
                
                {selectedCategory && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {categories.find(cat => cat.slug === selectedCategory)?.name}
                      <button
                        onClick={() => handleCategoryChange('')}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200 focus:outline-none"
                        aria-label="Hapus filter kategori"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </div>

      {/* Featured Categories Section */}
      {!searchTerm && !selectedCategory && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Kategori Populer
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Temukan produk sesuai kebutuhan Anda
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.slice(0, 6).map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleCategoryChange(category.slug)
                    }
                  }}
                  className="group cursor-pointer bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  tabIndex="0"
                  role="button"
                  aria-label={`Lihat produk kategori ${category.name}`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">
                      {category.slug === 'photobox' && '📦'}
                      {category.slug === 'cetak-foto' && '📸'}
                      {category.slug === 'album-foto' && '📚'}
                      {category.slug === 'frame-foto' && '🖼️'}
                      {category.slug === 'merchandise' && '🎁'}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Catalog 