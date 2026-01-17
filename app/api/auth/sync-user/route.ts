import { NextRequest, NextResponse } from "next/server"
import { syncUser } from "@/lib/supabase-db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, name, image } = body

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Upsert user to database
    const user = await syncUser({
      id,
      email: email || null,
      name: name || null,
      image: image || null,
    })

    if (!user) {
      return NextResponse.json({ error: "Failed to sync user" }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
