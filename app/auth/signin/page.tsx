"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

async function syncUserToDatabase(user: User) {
  try {
    await fetch("/api/auth/sync-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        image: user.user_metadata?.avatar_url,
      }),
    })
  } catch (error) {
    console.error("Failed to sync user to database:", error)
  }
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
      } else if (signInData.user) {
        // Sync user to database
        await syncUserToDatabase(signInData.user)
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || undefined,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
      } else if (signUpData.user) {
        // Sync user to database
        await syncUserToDatabase(signUpData.user)
        // Auto sign in after sign up
        const { data: autoSignInData, error: autoSignInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (autoSignInError) {
          setError(autoSignInError.message)
        } else if (autoSignInData.user) {
          router.push("/dashboard")
          router.refresh()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      // Try to sign in with test user
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "123456",
      })

      // If login fails, try to create the test user first
      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: "test@example.com",
          password: "123456",
          options: {
            data: {
              name: "Test User",
            },
          },
        })

        if (signUpError) {
          setError(`Failed to create test user: ${signUpError.message}`)
        } else {
          // Try to sign in again after registration
          const { data: signInData, error: retryError } = await supabase.auth.signInWithPassword({
            email: "test@example.com",
            password: "123456",
          })

          if (retryError) {
            setError(`Failed to sign in: ${retryError.message}`)
          } else if (signInData.user) {
            await syncUserToDatabase(signInData.user)
            router.push("/dashboard")
            router.refresh()
          }
        }
      } else if (signInData.user) {
        await syncUserToDatabase(signInData.user)
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
            <CardTitle className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Create a new account to start creating greeting cards"
                : "Sign in to your account to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="default"
              className="w-full"
              onClick={handleQuickLogin}
              disabled={isLoading}
            >
              ⚡ Đăng nhập nhanh (Test User)
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
