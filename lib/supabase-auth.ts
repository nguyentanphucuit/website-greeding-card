import { createServerClient } from './supabase-server'

export async function getSession() {
  const supabase = createServerClient()
  if (!supabase) return null
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    return session
  } catch (error) {
    console.error('Error in getSession:', error)
    return null
  }
}

export async function getUser() {
  const supabase = createServerClient()
  if (!supabase) return null
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Error in getUser:', error)
    return null
  }
}

