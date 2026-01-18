"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Wait a moment for auth session to be established
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Check if user is admin
          const response = await fetch("/api/auth/check-admin")
          if (response.ok) {
            const { isAdmin } = await response.json()
            if (isAdmin) {
              router.push("/admin")
            } else {
              router.push("/dashboard")
            }
          } else {
            router.push("/dashboard")
          }
        } else {
          router.push("/auth/signin")
        }
      } catch (error) {
        console.error("Error in auth callback:", error)
        router.push("/auth/signin")
      }
    }

    checkAuthAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  )
}
