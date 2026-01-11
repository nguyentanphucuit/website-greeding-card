"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChevronDown, Folder, Filter } from "lucide-react"
import { useState, Suspense } from "react"

interface Template {
  id: number
  title: string
  category: string
  style: string
  image: string
  free: boolean
}

const allTemplates: Template[] = [
  {
    id: 1,
    title: "Cheers to 2024! Happy New Year",
    category: "New Year",
    style: "Elegant",
    image: "https://picsum.photos/400/400?random=1",
    free: true,
  },
  {
    id: 2,
    title: "Happy New Year 2023",
    category: "New Year",
    style: "Modern",
    image: "https://picsum.photos/400/400?random=2",
    free: true,
  },
  {
    id: 3,
    title: "Classy Elegant New Year",
    category: "New Year",
    style: "Elegant",
    image: "https://picsum.photos/400/400?random=3",
    free: true,
  },
  {
    id: 4,
    title: "Watercolor New Year's",
    category: "New Year",
    style: "Fun",
    image: "https://picsum.photos/400/400?random=4",
    free: true,
  },
  {
    id: 5,
    title: "You're Invited!",
    category: "New Year",
    style: "Fun",
    image: "https://picsum.photos/400/400?random=5",
    free: true,
  },
  {
    id: 6,
    title: "Heartfelt New Year Wishes",
    category: "New Year",
    style: "Elegant",
    image: "https://picsum.photos/400/400?random=6",
    free: true,
  },
  {
    id: 7,
    title: "Corporate New Year Flyer",
    category: "New Year",
    style: "Classy",
    image: "https://picsum.photos/400/400?random=7",
    free: true,
  },
  {
    id: 8,
    title: "Inspiring New Year messages",
    category: "New Year",
    style: "Modern",
    image: "https://picsum.photos/400/400?random=8",
    free: true,
  },
  {
    id: 9,
    title: "New Year Party Invitation",
    category: "New Year",
    style: "Fun",
    image: "https://picsum.photos/400/400?random=9",
    free: true,
  },
  {
    id: 10,
    title: "Business New Year greetings",
    category: "New Year",
    style: "Classy",
    image: "https://picsum.photos/400/400?random=10",
    free: true,
  },
  {
    id: 11,
    title: "Clear New Year Audience",
    category: "New Year",
    style: "Minimalist",
    image: "https://picsum.photos/400/400?random=11",
    free: true,
  },
  {
    id: 12,
    title: "Luxury New Year GOFB))",
    category: "New Year",
    style: "Elegant",
    image: "https://picsum.photos/400/400?random=12",
    free: true,
  },
  {
    id: 13,
    title: "Happy Birthday to you!",
    category: "Birthday",
    style: "Fun",
    image: "https://picsum.photos/400/400?random=13",
    free: true,
  },
  {
    id: 14,
    title: "Birthday Celebration",
    category: "Birthday",
    style: "Modern",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop",
    free: true,
  },
  {
    id: 15,
    title: "FINANCIAL PLANNING SEMINAR",
    category: "Business",
    style: "Classy",
    image: "https://picsum.photos/400/400?random=14",
    free: false,
  },
  {
    id: 16,
    title: "Unlock insights and Learn from Experts",
    category: "Business",
    style: "Modern",
    image: "https://picsum.photos/400/400?random=15",
    free: true,
  },
  {
    id: 17,
    title: "YOU'RE INVITED!",
    category: "Event",
    style: "Fun",
    image: "https://picsum.photos/400/400?random=16",
    free: true,
  },
  {
    id: 18,
    title: "Celebration Time",
    category: "Event",
    style: "Modern",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop",
    free: true,
  },
  {
    id: 19,
    title: "Special Promotion",
    category: "Promotion",
    style: "Modern",
    image: "https://picsum.photos/400/400?random=17",
    free: false,
  },
  {
    id: 20,
    title: "Inspire Strength and Wellness Daily",
    category: "Event",
    style: "Minimalist",
    image: "https://picsum.photos/400/400?random=18",
    free: true,
  },
]

const categoryFilters = [
  { name: "New Year", count: 60 },
  { name: "Birthday", count: 42 },
  { name: "Wedding", count: 24 },
  { name: "Holiday", count: 21 },
  { name: "Thank You", count: 18 },
  { name: "Business", count: 83 },
  { name: "Events", count: 44 },
  { name: "Sale", count: 30 },
  { name: "Other", count: 50 },
]

const styleFilters = [
  { name: "Elegant", count: 28 },
  { name: "Modern", count: 19 },
  { name: "Classy", count: 22 },
  { name: "Fun", count: 21 },
  { name: "Minimalist", count: 16 },
]

const horizontalCategories = ["All", "New Year", "Birthday", "Wedding", "Business", "Event", "Promotion"]

function TemplatesPageContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category") || "New Year"
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedHorizontalCategory, setSelectedHorizontalCategory] = useState("All")
  const [isCategoryOpen, setIsCategoryOpen] = useState(true)
  const [isStyleOpen, setIsStyleOpen] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesCategory = selectedHorizontalCategory === "All" 
      ? (selectedCategory === "All" || template.category === selectedCategory)
      : template.category === selectedHorizontalCategory
    const matchesStyle = !selectedStyle || template.style === selectedStyle
    return matchesCategory && matchesStyle
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <aside
            className={`${
              isSidebarOpen ? "block" : "hidden"
            } lg:block w-full lg:w-64 flex-shrink-0 bg-gray-50 lg:bg-transparent p-4 lg:p-0 rounded-lg lg:rounded-none mb-4 lg:mb-0`}
          >
            {/* Category Filter */}
            <div className="mb-6 border-b pb-4">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between text-left font-semibold text-gray-900 mb-3"
              >
                <span>Category</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isCategoryOpen && (
                <div className="space-y-2">
                  {categoryFilters.map((filter) => {
                    const isSelected = selectedCategory === filter.name
                    return (
                      <button
                        key={filter.name}
                        onClick={() => {
                          setSelectedCategory(filter.name)
                          setSelectedHorizontalCategory("All")
                        }}
                        className={`w-full flex items-center justify-between px-2 py-2 rounded text-sm transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && <Folder className="h-4 w-4 text-blue-600" />}
                          <span>{filter.name}</span>
                        </div>
                        <span className="text-gray-500">{filter.count}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Style Filter */}
            <div className="mb-6 border-b pb-4">
              <button
                onClick={() => setIsStyleOpen(!isStyleOpen)}
                className="w-full flex items-center justify-between text-left font-semibold text-gray-900 mb-3"
              >
                <span>Filter by Style</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isStyleOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isStyleOpen && (
                <div className="space-y-2">
                  {styleFilters.map((filter) => {
                    const isSelected = selectedStyle === filter.name
                    return (
                      <button
                        key={filter.name}
                        onClick={() => setSelectedStyle(isSelected ? null : filter.name)}
                        className={`w-full flex items-center justify-between px-2 py-2 rounded text-sm transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{filter.name}</span>
                        <span className="text-gray-500">{filter.count}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Page Title and Popular Dropdown */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Templates / {selectedCategory === "All" ? "All Templates" : `${selectedCategory} Templates`}
              </h1>
              <Select defaultValue="popular">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Popular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Horizontal Category Filters */}
            <div className="flex flex-wrap gap-3 mb-8">
              {horizontalCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedHorizontalCategory === category ? "default" : "outline"}
                  className={
                    selectedHorizontalCategory === category
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                  onClick={() => {
                    setSelectedHorizontalCategory(category)
                    if (category !== "All") {
                      setSelectedCategory(category)
                    }
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Template Grid */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 hidden lg:block">
                Templates / {selectedCategory === "All" ? "All Templates" : `${selectedCategory} Templates`}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="group p-0 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  >
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
                      <Link href="/create">
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Use Template
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 pt-20 pb-16">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    }>
      <TemplatesPageContent />
    </Suspense>
  )
}

