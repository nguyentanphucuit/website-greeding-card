import { NextRequest, NextResponse } from "next/server"
import { getAllUsers } from "@/lib/supabase-db"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : undefined

    const users = await getAllUsers(request, accessToken)
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
