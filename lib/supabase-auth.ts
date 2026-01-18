import { createServerClient } from './supabase-server'
import type { NextRequest } from 'next/server'

export async function getSession(request?: NextRequest) {
  const supabase = createServerClient(request?.cookies as any)
  if (!supabase) return null
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      // Don't log expected auth errors (missing session is normal for unauthenticated requests)
      const isExpectedAuthError = error.name === 'AuthSessionMissingError' || (error as any).__isAuthError === true
      if (!isExpectedAuthError) {
        console.error('Error getting session:', error)
      }
      return null
    }
    return session
  } catch (error) {
    // Don't log expected auth errors
    const isExpectedAuthError = error instanceof Error && (error.name === 'AuthSessionMissingError' || (error as any).__isAuthError === true)
    if (!isExpectedAuthError) {
      console.error('Error in getSession:', error)
    }
    return null
  }
}

export async function getUser(request?: NextRequest) {
  // Try Authorization header first
  const authHeader = request?.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1]
    const supabase = createServerClient()
    if (!supabase) return null
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (!error && user) {
        return user
      }
    } catch (error) {
      // Fall through to cookie-based auth
    }
  }
  
  // Fall back to cookie-based auth
  const supabase = createServerClient(request?.cookies as any)
  if (!supabase) {
    console.warn('getUser: Supabase client not initialized (missing env vars)')
    return null
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      // Log all auth errors for debugging
      console.log('getUser error:', {
        name: error.name,
        message: error.message,
        status: (error as any).status,
        hasCookies: !!request?.cookies,
        cookieCount: request?.cookies ? Array.from(request.cookies.getAll()).length : 0,
      })
      return null
    }
    if (!user) {
      console.log('getUser: No user found - user may not be authenticated')
    }
    return user
  } catch (error) {
    console.error('getUser exception:', error)
    return null
  }
}

