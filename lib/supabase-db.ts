import { supabase } from './supabase-client'
import { createServerClient } from './supabase-server'
import type { Database } from './supabase-client'
import type { NextRequest } from 'next/server'

type Tables = Database['public']['Tables']
type User = Tables['users']['Row']
type Card = Tables['cards']['Row']
type CardInsert = Tables['cards']['Insert']
type CardUpdate = Tables['cards']['Update']

/**
 * Get user by ID
 * Note: Uses server client for API routes
 */
export async function getUserById(userId: string): Promise<User | null> {
  console.log("getUserById: Looking for userId:", userId)
  // Use server client for API routes (server-side)
  const supabaseClient = createServerClient()
  if (!supabaseClient) {
    console.error("getUserById: Supabase client not initialized")
    return null
  }

  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('getUserById error:', error.message, error.code, error.details)
    return null
  }

  console.log("getUserById: Found user:", data ? { id: data.id, email: data.email, role: data.role } : null)
  return data
}

/**
 * Sync user to database (called after auth)
 * Note: Uses server client for API routes
 */
export async function syncUser(userData: {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}): Promise<User | null> {
  // Use server client for API routes (server-side)
  const supabaseClient = createServerClient()
  if (!supabaseClient) {
    console.error('Sync user error: Supabase client not initialized')
    return null
  }

  const { data, error } = await supabaseClient
    .from('users')
    .upsert({
      id: userData.id,
      email: userData.email || null,
      name: userData.name || null,
      image: userData.image || null,
    }, {
      onConflict: 'id'
    })
    .select()
    .single()

  if (error) {
    console.error('Sync user error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    return null
  }

  return data
}

/**
 * Get all cards for a user
 * Note: Uses server client for API routes
 */
export async function getUserCards(userId: string): Promise<Card[]> {
  // Use server client for API routes (server-side)
  const supabaseClient = createServerClient()
  if (!supabaseClient) return []

  const { data, error } = await supabaseClient
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get user cards error:', error)
    return []
  }

  return data || []
}

/**
 * Get card by ID
 */
export async function getCardById(cardId: string): Promise<Card | null> {
  // Use server client for API routes (server-side)
  const supabaseClient = createServerClient()
  if (!supabaseClient) return null

  const { data, error } = await supabaseClient
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (error) {
    console.error('Get card error:', error)
    return null
  }

  return data
}

/**
 * Create a new card
 * Note: Uses server client for API routes
 */
export async function createCard(cardData: CardInsert): Promise<Card | null> {
  // Use server client for API routes (server-side)
  const supabaseClient = createServerClient()
  if (!supabaseClient) return null

  const { data, error } = await supabaseClient
    .from('cards')
    .insert(cardData)
    .select()
    .single()

  if (error) {
    console.error('Create card error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    return null
  }

  return data
}

/**
 * Update a card
 * Note: Uses server client for API routes
 */
export async function updateCard(
  cardId: string,
  updates: CardUpdate
): Promise<Card | null> {
  // Use server client for API routes (server-side)
  const supabaseClient = createServerClient()
  if (!supabaseClient) return null

  const { data, error } = await supabaseClient
    .from('cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single()

  if (error) {
    console.error('Update card error:', error)
    return null
  }

  return data
}

/**
 * Delete a card
 * Note: Uses server client for API routes
 */
export async function deleteCard(cardId: string): Promise<boolean> {
  // Use server client for API routes (server-side)
  const supabaseClient = createServerClient()
  if (!supabaseClient) return false

  const { error } = await supabaseClient
    .from('cards')
    .delete()
    .eq('id', cardId)

  if (error) {
    console.error('Delete card error:', error)
    return false
  }

  return true
}

/**
 * Get all cards (admin only)
 */
export async function getAllCards(request?: NextRequest, accessToken?: string): Promise<(Card & { user: User })[]> {
  const supabaseClient = request ? createServerClient(request.cookies as any, accessToken) : supabase
  if (!supabaseClient) return []

  const { data, error } = await supabaseClient
    .from('cards')
    .select(`
      *,
      user:users(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get all cards error:', error)
    return []
  }

  return data as any || []
}

/**
 * Get all users (admin only)
 * Note: Requires RLS policy allowing admins to view all users
 */
export async function getAllUsers(request?: NextRequest, accessToken?: string): Promise<User[]> {
  const supabaseClient = request ? createServerClient(request.cookies as any, accessToken) : supabase
  if (!supabaseClient) return []

  console.log('getAllUsers - Using accessToken:', !!accessToken)
  
  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get all users error:', error.message, error.code, error.details)
    // If RLS policy error, provide helpful message
    if (error.message?.includes('row-level security') || error.code === '42501') {
      console.error('RLS policy missing. Add admin policy to users table.')
    }
    return []
  }

  console.log('getAllUsers - Success, found', data?.length || 0, 'users')
  return data || []
}

/**
 * Check if user is admin by role in database
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  console.log("isUserAdmin: Checking userId:", userId)
  const dbUser = await getUserById(userId)
  console.log("isUserAdmin: dbUser:", dbUser ? { id: dbUser.id, email: dbUser.email, role: dbUser.role } : null)
  const isAdmin = dbUser?.role === 'admin'
  console.log("isUserAdmin: result:", isAdmin)
  return isAdmin
}

/**
 * Update user plan
 * Note: Uses server client for API routes
 */
export async function updateUserPlan(
  userId: string,
  plan: 'free' | 'pro' | 'enterprise'
): Promise<boolean> {
  // Use server client for API routes (server-side)
  const supabaseClient = createServerClient()
  if (!supabaseClient) return false

  const { error } = await supabaseClient
    .from('users')
    .update({ plan })
    .eq('id', userId)

  if (error) {
    console.error('Update user plan error:', error)
    return false
  }

  return true
}
