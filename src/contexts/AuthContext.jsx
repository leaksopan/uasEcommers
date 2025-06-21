import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  
  // Use ref to prevent re-authentication on focus
  const isAuthenticatedRef = useRef(false)
  const lastAuthChangeRef = useRef(Date.now())

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener')
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const now = Date.now()
      const timeSinceLastChange = now - lastAuthChangeRef.current
      
      console.log('Auth state changed:', event, session?.user?.email, 'time since last:', timeSinceLastChange)
      
      // Prevent rapid auth changes (debouncing)
      if (timeSinceLastChange < 1000 && event !== 'INITIAL_SESSION') {
        console.log('Ignoring rapid auth change')
        return
      }
      
      lastAuthChangeRef.current = now
      
      try {
        if (session?.user) {
          console.log('User found, setting user state')
          setUser(session.user)
          isAuthenticatedRef.current = true
          
          // Set loading to false immediately for user, profile can load separately
          setLoading(false)
          
          // Load profile separately without blocking main loading
          getUserProfile(session.user.id)
        } else {
          console.log('No user found, clearing state')
          setUser(null)
          setUserProfile(null)
          isAuthenticatedRef.current = false
          setLoading(false)
        }
      } catch (error) {
        console.error('Error handling auth state change:', error)
        setLoading(false)
      }
    })

    // Handle page visibility to prevent unnecessary re-authentication
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticatedRef.current) {
        console.log('Page visible again, user already authenticated')
        // Don't trigger re-authentication if user is already authenticated
      }
    }

    const handleFocus = () => {
      if (isAuthenticatedRef.current) {
        console.log('Window focused, user already authenticated')
        // Don't trigger re-authentication if user is already authenticated
      }
    }

    // Add event listeners for visibility and focus
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      console.log('AuthProvider: Cleaning up auth listener')
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const getUserProfile = async (userId) => {
    try {
      setProfileLoading(true)
      console.log('Getting user profile for ID:', userId)
      
      // Increase timeout to 30 seconds for slow connections
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 30000)
      )
      
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise])

      if (error) {
        console.error('Error fetching user profile:', error)
        
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile...')
          await createDefaultProfile(userId)
        } else if (error.message === 'Profile fetch timeout') {
          console.error('Profile fetch timed out, using fallback profile')
          await createFallbackProfile(userId)
        } else {
          console.error('Unknown error fetching profile, using fallback:', error)
          await createFallbackProfile(userId)
        }
      } else {
        console.log('User profile found:', data)
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      // Create fallback profile instead of leaving null
      await createFallbackProfile(userId)
    } finally {
      setProfileLoading(false)
    }
  }

  const createDefaultProfile = async (userId) => {
    try {
      // Get current user for email
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        console.error('No current user found for profile creation')
        await createFallbackProfile(userId)
        return
      }
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: currentUser.email || '',
            full_name: currentUser.user_metadata?.full_name || 'User',
            role: 'customer'
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        await createFallbackProfile(userId)
      } else {
        console.log('Profile created successfully:', newProfile)
        setUserProfile(newProfile)
      }
    } catch (error) {
      console.error('Error in createDefaultProfile:', error)
      await createFallbackProfile(userId)
    }
  }

  const createFallbackProfile = async (userId) => {
    try {
      console.log('Creating fallback profile for user:', userId)
      // Get current user for basic info
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      const fallbackProfile = {
        id: userId,
        email: currentUser?.email || 'unknown@example.com',
        full_name: currentUser?.user_metadata?.full_name || 'User',
        role: 'customer',
        created_at: new Date().toISOString(),
        // Mark as fallback so we know it's not from database
        _isFallback: true
      }
      
      console.log('Setting fallback profile:', fallbackProfile)
      setUserProfile(fallbackProfile)
    } catch (error) {
      console.error('Error creating fallback profile:', error)
      // Last resort - minimal profile
      setUserProfile({
        id: userId,
        email: 'unknown@example.com',
        full_name: 'User',
        role: 'customer',
        _isFallback: true
      })
    }
  }

  const signUp = async (email, password, fullName) => {
    try {
      console.log('Signing up user:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: undefined // Disable email verification
        }
      })

      if (error) throw error
      
      // If user is created but not confirmed, auto-confirm them
      if (data.user && !data.user.email_confirmed_at) {
        // User will be auto-confirmed by our database trigger
        console.log('User registered successfully')
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('Signing in user:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      console.log('Sign in successful')
      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out user')
      isAuthenticatedRef.current = false
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setUserProfile(null)
      setProfileLoading(false)
      console.log('Sign out successful')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut
  }

  console.log('AuthProvider render - loading:', loading, 'user:', !!user, 'profile:', !!userProfile, 'profileLoading:', profileLoading)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 