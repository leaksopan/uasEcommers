import { supabase } from './supabase'

export const orderService = {
  // Get orders for a specific user
  async getUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            variant_name,
            quantity,
            price,
            subtotal,
            order_photos (
              id,
              file_name,
              file_path,
              upload_status
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user orders:', error)
      return { data: null, error: error.message }
    }
  },

  // Get single order by ID
  async getOrderById(orderId, userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            variant_name,
            quantity,
            price,
            subtotal,
            product_data,
            order_photos (
              id,
              file_name,
              file_path,
              upload_status,
              metadata
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching order:', error)
      return { data: null, error: error.message }
    }
  },

  // Get order statistics for user
  async getUserOrderStats(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount')
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      const stats = {
        totalOrders: data.length,
        totalSpent: data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
        pendingOrders: data.filter(order => order.status === 'pending').length,
        processingOrders: data.filter(order => order.status === 'processing').length,
        completedOrders: data.filter(order => order.status === 'delivered').length,
        cancelledOrders: data.filter(order => order.status === 'cancelled').length
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error fetching order stats:', error)
      return { data: null, error: error.message }
    }
  },

  // Cancel order (if allowed)
  async cancelOrder(orderId, userId) {
    try {
      // First check if order can be cancelled
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      if (orderData.status !== 'pending') {
        throw new Error('Pesanan tidak dapat dibatalkan karena sudah diproses')
      }

      // Update order status to cancelled
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', userId)
        .select()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error cancelling order:', error)
      return { data: null, error: error.message }
    }
  }
}

export default orderService 