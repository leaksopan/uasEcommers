import { supabase } from './supabase'

const PROJECT_ID = 'xsqaokhbrnhqwfacbwyi'

export const adminService = {
  // Products Management
  products: {
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_categories(name)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        return data.map(product => ({
          ...product,
          category_name: product.product_categories?.name || 'Tanpa Kategori'
        }))
      } catch (error) {
        console.error('Error fetching products:', error)
        throw error
      }
    },

    getById: async (id) => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Error fetching product:', error)
        throw error
      }
    },

    create: async (productData) => {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: productData.name,
            slug: productData.slug,
            description: productData.description,
            short_description: productData.short_description,
            price: productData.price,
            original_price: productData.original_price || null,
            sku: productData.sku,
            stock_quantity: productData.stock_quantity,
            category_id: productData.category_id,
            images: productData.images || [],
            is_active: productData.is_active,
            is_featured: productData.is_featured
          }])
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Error creating product:', error)
        throw error
      }
    },

    update: async (id, productData) => {
      try {
        const { data, error } = await supabase
          .from('products')
          .update({
            name: productData.name,
            slug: productData.slug,
            description: productData.description,
            short_description: productData.short_description,
            price: productData.price,
            original_price: productData.original_price || null,
            sku: productData.sku,
            stock_quantity: productData.stock_quantity,
            category_id: productData.category_id,
            images: productData.images || [],
            is_active: productData.is_active,
            is_featured: productData.is_featured,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Error updating product:', error)
        throw error
      }
    },

    delete: async (id) => {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)

        if (error) throw error
        return true
      } catch (error) {
        console.error('Error deleting product:', error)
        throw error
      }
    }
  },

  // Categories Management
  categories: {
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('product_categories')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) throw error
        return data
      } catch (error) {
        console.error('Error fetching categories:', error)
        throw error
      }
    },

    create: async (categoryData) => {
      try {
        const { data, error } = await supabase
          .from('product_categories')
          .insert([{
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            is_active: true
          }])
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Error creating category:', error)
        throw error
      }
    }
  },

  // Orders Management
  orders: {
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              product_name,
              variant_name,
              price,
              quantity,
              subtotal,
              order_photos (
                id,
                file_name,
                file_path,
                file_size,
                mime_type
              )
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        return data.map(order => ({
          ...order,
          item_count: order.order_items?.length || 0,
          photo_count: order.order_items?.reduce((count, item) => 
            count + (item.order_photos?.length || 0), 0) || 0
        }))
      } catch (error) {
        console.error('Error fetching orders:', error)
        throw error
      }
    },

    getById: async (id) => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              product_id,
              variant_id,
              product_name,
              variant_name,
              price,
              quantity,
              subtotal,
              product_data,
              order_photos (
                id,
                file_name,
                file_path,
                file_size,
                mime_type,
                upload_status,
                sort_order,
                metadata
              )
            )
          `)
          .eq('id', id)
          .single()

        if (error) throw error

        return data
      } catch (error) {
        console.error('Error fetching order details:', error)
        throw error
      }
    },

    updateStatus: async (id, status) => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ 
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return data
      } catch (error) {
        console.error('Error updating order status:', error)
        throw error
      }
    },

    getPhotos: async (orderItemId) => {
      try {
        const { data, error } = await supabase
          .from('order_photos')
          .select('*')
          .eq('order_item_id', orderItemId)
          .order('sort_order')
          .order('created_at')

        if (error) throw error
        return data
      } catch (error) {
        console.error('Error fetching photos:', error)
        throw error
      }
    }
  },

  // Photo Management
  photos: {
    getUrl: (filePath) => {
      if (!filePath) return null
      
      // Check if it's already a full URL
      if (filePath.startsWith('http')) {
        return filePath
      }

      // Generate public URL from Supabase storage
      const { data } = supabase.storage
        .from('order-photos')
        .getPublicUrl(filePath)

      return data.publicUrl
    },

    async download(filePath, fileName) {
      try {
        if (filePath.startsWith('http')) {
          // If it's already a public URL, download directly
          const link = document.createElement('a')
          link.href = filePath
          link.download = fileName
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return true
        }

        // Download from Supabase storage
        const { data, error } = await supabase.storage
          .from('order-photos')
          .download(filePath)

        if (error) throw error

        // Create blob URL and download
        const url = URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        return true
      } catch (error) {
        console.error('Error downloading photo:', error)
        throw error
      }
    }
  },

  // Statistics
  stats: {
    getDashboard: async () => {
      try {
        const [ordersData, productsData, usersData] = await Promise.all([
          supabase.from('orders').select('id, status, total_amount, created_at'),
          supabase.from('products').select('id, is_active'),
          supabase.from('user_profiles').select('id, created_at')
        ])

        if (ordersData.error) throw ordersData.error
        if (productsData.error) throw productsData.error
        if (usersData.error) throw usersData.error

        const orders = ordersData.data || []
        const products = productsData.data || []
        const users = usersData.data || []

        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, order) => 
          sum + parseFloat(order.total_amount || 0), 0)
        const totalProducts = products.length
        const totalUsers = users.length

        const pendingOrders = orders.filter(order => 
          order.status === 'pending').length
        const processingOrders = orders.filter(order => 
          order.status === 'processing').length
        const completedOrders = orders.filter(order => 
          order.status === 'delivered').length

        // Get photo count
        const { data: photoData, error: photoError } = await supabase
          .from('order_photos')
          .select('id')

        const totalPhotos = photoData?.length || 0

        return {
          totalOrders,
          totalRevenue,
          totalProducts,
          totalUsers,
          pendingOrders,
          processingOrders,
          completedOrders,
          totalPhotos
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        throw error
      }
    }
  }
}

export default adminService 