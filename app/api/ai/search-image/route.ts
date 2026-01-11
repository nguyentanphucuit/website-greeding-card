import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      )
    }

    // Use Unsplash API to search for images
    // For now, we'll use a placeholder service
    // You can integrate with Unsplash API if you have an access key
    
    // Using Unsplash Source API (no key required, but rate limited)
    const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`

    return NextResponse.json({
      imageUrl: imageUrl,
      query: query,
    })
  } catch (error: any) {
    console.error("Error searching image:", error)
    return NextResponse.json(
      { error: "Failed to search image" },
      { status: 500 }
    )
  }
}


