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
  // Use server client for API routes (server-side)
  const supabaseClient = createServerClient()
  if (!supabaseClient) return null

  const { data, error } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Get user error:', error)
    return null
  }

  return data
}

/**
 * Sync user to database (called after auth)
 */
export async function syncUser(userData: {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}): Promise<User | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userData.id,
      email: userData.email || null,
      name: userData.name || null,
      image: userData.image || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Sync user error:', error)
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
 */
export async function deleteCard(cardId: string): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
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
 * Check if user is admin
 */
export async function isUserAdmin(userId: string, request?: NextRequest, accessToken?: string): Promise<boolean> {
  // Use same client creation as getAllCards (which works and successfully queries user:users(*))
  const supabaseClient = request ? createServerClient(request.cookies as any, accessToken) : supabase
  if (!supabaseClient) return false

  console.log('isUserAdmin - userId:', userId, 'hasToken:', !!accessToken)

  // Method 1: Get role from getAllCards (this works because getAllCards queries user:users(*) successfully)
  // This bypasses the schema cache error with direct users query
  try {
    const allCards = await getAllCards(request, accessToken)
    // Find user in cards list - if user has any cards, we can get their role
    const userCard = allCards.find(card => card.user?.id === userId)
    if (userCard?.user?.role) {
      console.log('isUserAdmin - User role (from getAllCards):', userCard.user.role)
      return userCard.user.role === 'admin'
    }
  } catch (e) {
    console.log('isUserAdmin - getAllCards approach failed:', e)
  }

  // Method 2: Try querying via cards table join directly (same pattern as getAllCards)
  try {
    const { data: cardData, error: cardError } = await supabaseClient
      .from('cards')
      .select('user:users!inner(id, role)')
      .eq('user:users.id', userId)
      .limit(1)
      .maybeSingle()
    
    if (!cardError && cardData?.user?.role) {
      console.log('isUserAdmin - User role (from cards join):', cardData.user.role)
      return cardData.user.role === 'admin'
    } else if (cardError) {
      console.log('isUserAdmin - Cards join error (user may have no cards):', cardError.message)
    }
  } catch (e) {
    console.log('isUserAdmin - Cards join approach failed:', e)
  }

  // Method 3: Try getAllUsers (may fail with schema cache error, but try anyway)
  try {
    const allUsers = await getAllUsers(request, accessToken)
    const user = allUsers.find(u => u.id === userId)
    if (user) {
      console.log('isUserAdmin - User role (from getAllUsers):', user.role)
      return user.role === 'admin'
    }
  } catch (e) {
    console.log('isUserAdmin - getAllUsers approach failed (likely schema cache error):', e)
  }

  // Method 4: Try direct query to users table (likely to fail with schema cache error)
  const { data, error } = await supabaseClient
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST205') {
      console.error('isUserAdmin - Schema cache error (PGRST205). Cannot query users table directly.')
      console.error('isUserAdmin - All methods failed. User may not have any cards to check role from.')
      return false
    }
    console.error('isUserAdmin - Error querying users:', error.message, error.code, error.details)
    return false
  }

  if (!data) {
    console.log('isUserAdmin - No data returned from users query')
    return false
  }

  console.log('isUserAdmin - User role (from direct query):', data.role)
  return data.role === 'admin'
}

/**
 * Update user plan
 */
export async function updateUserPlan(
  userId: string,
  plan: 'free' | 'pro' | 'enterprise'
): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('users')
    .update({ plan })
    .eq('id', userId)

  if (error) {
    console.error('Update user plan error:', error)
    return false
  }

  return true
}
