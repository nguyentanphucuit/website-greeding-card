import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/supabase-auth"
import { isUserAdmin } from "@/lib/supabase-db"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      console.log("check-admin: No user")
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }
    
    console.log("check-admin: User found - id:", user.id, "email:", user.email)
    
    const isAdmin = await isUserAdmin(user.id)
    console.log("check-admin: isAdmin:", isAdmin)
    
    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error("check-admin error:", error)
    return NextResponse.json({ isAdmin: false }, { status: 200 })
  }
}
