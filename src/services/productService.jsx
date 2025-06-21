import { supabase } from './supabase.js'

// Get all categories
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { data: null, error: error.message }
  }
}

// Get all products with category info
export const getProducts = async (filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories!inner(
          id,
          name,
          slug
        ),
        product_variants(*)
      `)
      .eq('is_active', true)

    // Apply filters
    if (filters.category_slug) {
      query = query.eq('product_categories.slug', filters.category_slug)
    }

    if (filters.is_featured) {
      query = query.eq('is_featured', true)
    }

    if (filters.min_price && filters.max_price) {
      query = query.gte('price', filters.min_price).lte('price', filters.max_price)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at'
    const sortOrder = filters.sort_order || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { data: null, error: error.message }
  }
}

// Get products by category
export const getProductsByCategory = async (categorySlug) => {
  return await getProducts({ category_slug: categorySlug })
}

// Get featured products
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories!inner(
          id,
          name,
          slug
        ),
        product_variants(*)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('sort_order')
      .limit(limit)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return { data: null, error: error.message }
  }
}

// Get single product by slug
export const getProductBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories!inner(
          id,
          name,
          slug
        ),
        product_variants(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { data: null, error: error.message }
  }
}

// Get product variants
export const getProductVariants = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching product variants:', error)
    return { data: null, error: error.message }
  }
}

// Search products
export const searchProducts = async (searchTerm, filters = {}) => {
  return await getProducts({ 
    search: searchTerm,
    ...filters 
  })
}

// Helper function to format price
export const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Helper function to get main image
export const getMainImage = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0]
  }
  return '/images/placeholder-product.jpg' // fallback image
}

// Helper function to check if product has discount
export const hasDiscount = (product) => {
  return product.original_price && product.original_price > product.price
}

// Helper function to calculate discount percentage
export const getDiscountPercentage = (product) => {
  if (!hasDiscount(product)) return 0
  
  const discount = ((product.original_price - product.price) / product.original_price) * 100
  return Math.round(discount)
} 