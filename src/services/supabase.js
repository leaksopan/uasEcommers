import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xsqaokhbrnhqwfacbwyi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcWFva2hicm5ocXdmYWNid3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjYzNjQsImV4cCI6MjA2NjA0MjM2NH0.qND-Qrc1JeLZIsVyWQU0q3-E5BIUy0-XbZ3DzIxeLYE'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Reduce token refresh frequency to prevent loading on browser focus
    // Default is 600 seconds (10 minutes), we increase to 30 minutes
    refreshOnPageVisibility: false,  // Disable refresh on page visibility change
    // Only refresh when token is actually expiring
    minThresholdBeforeRefresh: 30 * 60 // 30 minutes before expiry
  }
})

export default supabase 