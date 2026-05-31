"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, User as UserIcon, Mail, Lock, ArrowUpRight, Paperclip } from "lucide-react"

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

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false) // Default to sign in
  const [name, setName] = useState("")
  const [sparkles, setSparkles] = useState<Array<{left: string, top: string, delay: string, duration: string}>>([])

  useEffect(() => {
    // Generate sparkle data only on client after mount
    setSparkles([...Array(30)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`,
    })))
  }, [])

  const checkAdminAndRedirect = async (email: string) => {
    // Simple: Check if email is admin@gmail.com
    if (email.toLowerCase().trim() === 'admin@gmail.com') {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
  }

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
        await syncUserToDatabase(signInData.user)
        await checkAdminAndRedirect(signInData.user.email || '')
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
        await syncUserToDatabase(signUpData.user)
        const { data: autoSignInData, error: autoSignInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (autoSignInError) {
          setError(autoSignInError.message)
        } else if (autoSignInData.user) {
          await checkAdminAndRedirect(autoSignInData.user.email || '')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook" | "linkedin") => {
    setIsLoading(true)
    setError("")
    
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      // For OAuth, we'll redirect to a handler page that checks admin status
      // For now, redirect to dashboard - admin check will happen after OAuth callback
      const { error: socialError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (socialError) {
        setError(socialError.message)
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (type: 'admin' | 'user') => {
    setIsLoading(true)
    setError("")

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const credentials = type === 'admin'
        ? { email: "admin@gmail.com", password: "123123" }
        : { email: "testuser@test.com", password: "test123456" }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (signInError) {
        setError(signInError.message)
      } else if (signInData.user) {
        await syncUserToDatabase(signInData.user)
        await checkAdminAndRedirect(signInData.user.email || '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-blue-50 to-blue-100 relative overflow-hidden">
      {/* Sparkle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {sparkles.map((sparkle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{
              left: sparkle.left,
              top: sparkle.top,
              animationDelay: sparkle.delay,
              animationDuration: sparkle.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Get Started
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            Create an Account to Start Making Beautiful Cards
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm">No credit card required</span>
          </div>
                  </div>

        {/* Sign-Up Form Container */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          {/* Social Sign-Up Section */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4 text-center">
              Sign Up with Go<span className="text-blue-500 inline-block">o</span>
              <ArrowUpRight className="h-3 w-3 inline-block ml-0.5 text-blue-500" />
            </p>
            
            <div className="grid grid-cols-4 gap-3 mb-4">
              {/* Google */}
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full aspect-square p-0 border-2 hover:border-blue-300"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </Button>

              {/* Facebook */}
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full aspect-square p-0 border-2 bg-blue-600 hover:bg-blue-700 border-blue-600"
                onClick={() => handleSocialLogin("facebook")}
                disabled={isLoading}
              >
                <span className="text-white font-bold text-xl">f</span>
              </Button>

              {/* LinkedIn */}
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full aspect-square p-0 border-2 bg-blue-600 hover:bg-blue-700 border-blue-600"
                onClick={() => handleSocialLogin("linkedin")}
                disabled={isLoading}
              >
                <span className="text-white font-bold text-xs">in</span>
              </Button>

              {/* Paperclip */}
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full aspect-square p-0 border-2 bg-gray-100 hover:bg-gray-200 border-gray-300"
                disabled={isLoading}
              >
                <Paperclip className="h-5 w-5 text-gray-600" />
              </Button>
            </div>

            {/* Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-gray-600">or</span>
              </div>
            </div>
                  </div>
 {/* Quick Login Buttons - Always visible for testing */}
 <div className="flex gap-2 mb-3  ">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700 font-medium"
                onClick={() => handleQuickLogin('admin')}
                disabled={isLoading}
              >
                🚀 Quick Login: Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 bg-green-50 hover:bg-green-100 border-green-300 text-green-700 font-medium"
                onClick={() => handleQuickLogin('user')}
                disabled={isLoading}
              >
                👤 Quick Login: User
              </Button>
            </div>
          {/* Traditional Sign-Up Form */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
                  <div className="space-y-2">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="pl-10 h-12 border-gray-300"
                    />
                  </div>
              </div>
            )}

                  <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your-email@example.com"
                  className="pl-10 h-12 border-gray-300"
                    />
                  </div>
                  </div>

                  <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                  placeholder="Password"
                  className="pl-10 h-12 border-gray-300"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
          </form>

          {/* Login Prompt */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-600"
            >
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <span className="text-blue-600 hover:underline font-medium">Sign In</span>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <span className="text-blue-600 hover:underline font-medium">Sign Up</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
