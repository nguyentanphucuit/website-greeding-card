import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

// Server-side Supabase client
// Use this in API routes and server components
export const createServerClient = (cookieStore?: ReadonlyRequestCookies, accessToken?: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Supabase features may not work.')
    return null as any
  }
  
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      storage: cookieStore ? {
        getItem: (key: string) => {
          return cookieStore.get(key)?.value ?? null
        },
        setItem: (key: string, value: string) => {
          // Cookies are read-only - setting is handled via Response headers
        },
        removeItem: (key: string) => {
          // Cookies are read-only - removal is handled via Response headers
        },
      } : undefined,
    },
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : undefined,
    },
  })
  
  return client
}

