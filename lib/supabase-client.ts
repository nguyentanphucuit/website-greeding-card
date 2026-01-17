"use client"

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Supabase features may not work.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null as any

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          image: string | null
          plan: 'free' | 'pro' | 'enterprise'
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          image?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
          role?: 'user' | 'admin'
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          image?: string | null
          plan?: 'free' | 'pro' | 'enterprise'
          role?: 'user' | 'admin'
        }
      }
      cards: {
        Row: {
          id: string
          user_id: string
          title: string
          text: string
          background_image: string | null
          background_color: string
          text_color: string
          font_family: string
          font_size: number
          font_style: string
          text_container_background: string
          text_container_opacity: number
          initial_request: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          text: string
          background_image?: string | null
          background_color?: string
          text_color?: string
          font_family?: string
          font_size?: number
          font_style?: string
          text_container_background?: string
          text_container_opacity?: number
          initial_request?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          text?: string
          background_image?: string | null
          background_color?: string
          text_color?: string
          font_family?: string
          font_size?: number
          font_style?: string
          text_container_background?: string
          text_container_opacity?: number
          initial_request?: string | null
        }
      }
    }
  }
}

