import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/supabase-auth"
import { getAllCards, isUserAdmin } from "@/lib/supabase-db"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user is admin
    const isAdmin = await isUserAdmin(user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const cards = await getAllCards()
    return NextResponse.json(cards)
  } catch (error) {
    console.error("Error fetching admin cards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

