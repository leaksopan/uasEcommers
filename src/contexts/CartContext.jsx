import { createContext, useContext, useReducer, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './AuthContext'

const CartContext = createContext()

// Action types
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART_ITEMS: 'SET_CART_ITEMS',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR'
}

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0,
  totalPrice: 0
}

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case CART_ACTIONS.SET_CART_ITEMS:
      const items = action.payload
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items,
        totalItems,
        totalPrice,
        loading: false,
        error: null
      }
    
    case CART_ACTIONS.ADD_ITEM:
      const newItem = action.payload
      const existingIndex = state.items.findIndex(
        item => item.product_id === newItem.product_id && item.variant_id === newItem.variant_id
      )
      
      let updatedItems
      if (existingIndex >= 0) {
        updatedItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        updatedItems = [...state.items, newItem]
      }
      
      const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: updatedItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice
      }
    
    case CART_ACTIONS.UPDATE_ITEM:
      const { id, quantity } = action.payload
      const itemsAfterUpdate = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      
      const updatedTotalItems = itemsAfterUpdate.reduce((sum, item) => sum + item.quantity, 0)
      const updatedTotalPrice = itemsAfterUpdate.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: itemsAfterUpdate,
        totalItems: updatedTotalItems,
        totalPrice: updatedTotalPrice
      }
    
    case CART_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(item => item.id !== action.payload)
      const filteredTotalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0)
      const filteredTotalPrice = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredTotalItems,
        totalPrice: filteredTotalPrice
      }
    
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      }
    
    case CART_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { user } = useAuth()

  // Load cart items from database when user logs in
  useEffect(() => {
    if (user) {
      loadCartItems()
    } else {
      dispatch({ type: CART_ACTIONS.CLEAR_CART })
    }
  }, [user])

  const loadCartItems = async () => {
    if (!user) return

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            images,
            stock_quantity
          ),
          product_variants (
            id,
            name,
            price,
            stock_quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Format data untuk state
      const formattedItems = data.map(item => ({
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.variant_id ? item.product_variants.price : item.products.price,
        product: item.products,
        variant: item.product_variants,
        created_at: item.created_at
      }))

      dispatch({ type: CART_ACTIONS.SET_CART_ITEMS, payload: formattedItems })
    } catch (error) {
      console.error('Error loading cart items:', error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message })
    }
  }

  const addToCart = async (product, variant = null, quantity = 1) => {
    if (!user) {
      throw new Error('Anda harus login terlebih dahulu')
    }

    try {
      const cartItem = {
        user_id: user.id,
        product_id: product.id,
        variant_id: variant?.id || null,
        quantity
      }

      const { data, error } = await supabase
        .from('cart_items')
        .upsert(cartItem, {
          onConflict: 'user_id,product_id,variant_id',
          ignoreDuplicates: false
        })
        .select(`
          *,
          products (
            id,
            name,
            price,
            images,
            stock_quantity
          ),
          product_variants (
            id,
            name,
            price,
            stock_quantity
          )
        `)
        .single()

      if (error) throw error

      // Format item untuk state
      const formattedItem = {
        id: data.id,
        product_id: data.product_id,
        variant_id: data.variant_id,
        quantity: data.quantity,
        price: data.variant_id ? data.product_variants.price : data.products.price,
        product: data.products,
        variant: data.product_variants,
        created_at: data.created_at
      }

      dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: formattedItem })
      return formattedItem
    } catch (error) {
      console.error('Error adding to cart:', error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id)

      if (error) throw error

      dispatch({ type: CART_ACTIONS.UPDATE_ITEM, payload: { id: itemId, quantity } })
    } catch (error) {
      console.error('Error updating cart item:', error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  const removeFromCart = async (itemId) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id)

      if (error) throw error

      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: itemId })
    } catch (error) {
      console.error('Error removing from cart:', error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      dispatch({ type: CART_ACTIONS.CLEAR_CART })
    } catch (error) {
      console.error('Error clearing cart:', error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCartItems
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 