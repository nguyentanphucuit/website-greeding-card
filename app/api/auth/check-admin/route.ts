import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/supabase-auth"
import { isUserAdmin } from "@/lib/supabase-db"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }
    
    const adminStatus = await isUserAdmin(user.id)
    return NextResponse.json({ isAdmin: adminStatus })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false }, { status: 200 })
  }
}
