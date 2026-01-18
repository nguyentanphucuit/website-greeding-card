import { NextRequest, NextResponse } from "next/server"
import { syncUser } from "@/lib/supabase-db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, name, image } = body

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log('Sync user request:', { id, email, name, image: !!image })

    // Upsert user to database
    const user = await syncUser({
      id,
      email: email || null,
      name: name || null,
      image: image || null,
    })

    if (!user) {
      console.error("Failed to sync user: syncUser returned null")
      return NextResponse.json({ error: "Failed to sync user" }, { status: 500 })
    }

    console.log('User synced successfully:', user.id)
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
