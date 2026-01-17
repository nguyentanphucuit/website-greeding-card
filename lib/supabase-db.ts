import { supabase } from './supabase-client'
import type { Database } from './supabase-client'

type Tables = Database['public']['Tables']
type User = Tables['users']['Row']
type Card = Tables['cards']['Row']
type CardInsert = Tables['cards']['Insert']
type CardUpdate = Tables['cards']['Update']

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  if (!supabase) return null

  const { data, error } = await supabase
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
 */
export async function getUserCards(userId: string): Promise<Card[]> {
  if (!supabase) return []

  const { data, error } = await supabase
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
  if (!supabase) return null

  const { data, error } = await supabase
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
 */
export async function createCard(cardData: CardInsert): Promise<Card | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('cards')
    .insert(cardData)
    .select()
    .single()

  if (error) {
    console.error('Create card error:', error)
    return null
  }

  return data
}

/**
 * Update a card
 */
export async function updateCard(
  cardId: string,
  updates: CardUpdate
): Promise<Card | null> {
  if (!supabase) return null

  const { data, error } = await supabase
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
export async function getAllCards(): Promise<(Card & { user: User })[]> {
  if (!supabase) return []

  const { data, error } = await supabase
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
 * Check if user is admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return false
  }

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
