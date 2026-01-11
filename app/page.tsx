"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Search, Star, Users, Frame, MessageSquare, Paintbrush, Download } from "lucide-react"
import { useState } from "react"

const templates = [
  {
    id: 1,
    title: "2024 Happy New Year",
    category: "New Year",
    image: "https://picsum.photos/400/400?random=101",
    free: true,
  },
  {
    id: 2,
    title: "RESOLUTIONS, BRIGHT BEGINNINGS!",
    category: "New Year",
    image: "https://picsum.photos/400/400?random=102",
    free: true,
  },
  {
    id: 3,
    title: "Happy Birthday to you!",
    category: "Birthday",
    image: "https://picsum.photos/400/400?random=103",
    free: true,
  },
  {
    id: 4,
    title: "Heartfelt New Year Wishes",
    category: "New Year",
    image: "https://picsum.photos/400/400?random=104",
    free: true,
  },
  {
    id: 5,
    title: "FINANCIAL PLANNING SEMINAR",
    category: "Business",
    image: "https://picsum.photos/400/400?random=105",
    free: false,
  },
  {
    id: 6,
    title: "Unlock insights and Learn from Experts",
    category: "Business",
    image: "https://picsum.photos/400/400?random=106",
    free: true,
  },
  {
    id: 7,
    title: "YOU'RE INVITED!",
    category: "Event",
    image: "https://picsum.photos/400/400?random=107",
    free: true,
  },
  {
    id: 8,
    title: "Celebration Time",
    category: "Event",
    image: "https://picsum.photos/400/400?random=101",
    free: true,
  },
  {
    id: 9,
    title: "Special Promotion",
    category: "Promotion",
    image: "https://picsum.photos/400/400?random=108",
    free: false,
  },
  {
    id: 10,
    title: "Inspire Strength and Wellness Daily",
    category: "Event",
    image: "https://picsum.photos/400/400?random=109",
    free: true,
  },
]

const categories = ["All", "New Year", "Birthday", "Business", "Event", "Promotion"]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 mb-6 leading-tight">
              Create Stunning Greeting Cards in Seconds with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Design personalized greeting cards effortlessly — no design skills needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/create">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                  Create Your Card
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span>Rated 4.9/5 by users</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Used by 10,000+ creators</span>
              </div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-64 h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl transform rotate-6 opacity-50"></div>
              <div className="relative w-64 h-96 bg-white rounded-3xl shadow-2xl border-8 border-gray-800 overflow-hidden">
                <div className="h-full bg-gradient-to-br from-blue-500 to-purple-600 p-4 flex flex-col items-center justify-center text-white">
                  <div className="text-2xl font-bold mb-2">2024</div>
                  <div className="text-lg font-semibold">Happy New Year</div>
                  <div className="mt-4 text-sm text-center">New Year Template</div>
                  <Button size="sm" className="mt-4 bg-white text-blue-600 hover:bg-gray-100">
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Templates Section */}
      <section id="templates" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Browse Templates</h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search templates (e.g: 'New Year', 'Birthday')"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={selectedCategory === category ? "bg-blue-600 text-white" : ""}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
            <Button variant="outline" className="text-gray-600">
              More &gt;
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group p-0 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=${encodeURIComponent(template.title.substring(0, 20))}`
                    }}
                  />
                  {template.free && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      Free
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{template.title}</h3>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12">Making personalized greeting cards is quick and easy!</p>
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Frame className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">1.</div>
              <h3 className="font-semibold text-lg mb-2">Choose a template</h3>
              <p className="text-gray-600 text-sm">Select from suggested greeting cards.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">2.</div>
              <h3 className="font-semibold text-lg mb-2">Describe your message</h3>
              <p className="text-gray-600 text-sm">AI helps write it.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Paintbrush className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">3.</div>
              <h3 className="font-semibold text-lg mb-2">Customize the design</h3>
              <p className="text-gray-600 text-sm">Adjust font, colors, and images.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">4.</div>
              <h3 className="font-semibold text-lg mb-2">Download & share</h3>
              <p className="text-gray-600 text-sm">Download or share your card.</p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/how-it-works">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Creating Beautiful Personalized Cards in Seconds!
          </h2>
          <Link href="/create">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
