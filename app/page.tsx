import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent px-2">
            Intelligent Greeting Card Generator
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create beautiful, personalized greeting cards with AI-powered generation
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/create">
              <Button size="lg">Create Your Card</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="relative overflow-hidden border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold text-gray-900">AI-Powered Generation</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Generate unique greeting cards with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our intelligent system helps you create personalized cards in seconds
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold text-gray-900">Fully Customizable</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Control every aspect of your card design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Adjust fonts, colors, images, and styles to match your vision
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold text-gray-900">Export & Share</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Download high-quality images instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Export your cards as PNG images and share with loved ones
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
