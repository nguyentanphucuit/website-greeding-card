"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { user } = useSupabaseAuth()
  const pathname = usePathname()

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      window.location.href = "/"
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Greeting Cards
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/templates" 
            className={cn(
              "transition-colors",
              pathname === "/templates" 
                ? "text-blue-600 font-semibold" 
                : "text-gray-700 hover:text-blue-600"
            )}
          >
            Templates
          </Link>
          <Link 
            href="/how-it-works" 
            className={cn(
              "transition-colors",
              pathname === "/how-it-works" 
                ? "text-blue-600 font-semibold" 
                : "text-gray-700 hover:text-blue-600"
            )}
          >
            How It Works
          </Link>
          <Link 
            href="/pricing" 
            className={cn(
              "transition-colors",
              pathname === "/pricing" 
                ? "text-blue-600 font-semibold" 
                : "text-gray-700 hover:text-blue-600"
            )}
          >
            Pricing
          </Link>
          <Link 
            href="/#examples" 
            className={cn(
              "transition-colors",
              pathname === "/" 
                ? "text-blue-600 font-semibold" 
                : "text-gray-700 hover:text-blue-600"
            )}
          >
            Examples
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/create">
                <Button variant="outline">Create Card</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || ""} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">Sign In</Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
