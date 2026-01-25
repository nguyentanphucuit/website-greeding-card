"use client"

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
import { useRouter } from "next/navigation"
import { buildEditCardDataFromTemplate, getTemplateCategories, templates } from "@/lib/templates"

const categoryFilters = getTemplateCategories().map((name) => ({ name, count: templates.filter((t) => t.category === name).length }))

const horizontalCategories = ["All", ...getTemplateCategories()]

function TemplatesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category") || "All"
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedHorizontalCategory, setSelectedHorizontalCategory] = useState("All")
  const [isCategoryOpen, setIsCategoryOpen] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedHorizontalCategory === "All" 
      ? (selectedCategory === "All" || template.category === selectedCategory)
      : template.category === selectedHorizontalCategory
    return matchesCategory
  })

  const handleUseTemplate = (templateId: string) => {
    try {
      const editCardData = buildEditCardDataFromTemplate(templateId)
      sessionStorage.setItem("editCardData", JSON.stringify(editCardData))
      router.push("/create")
    } catch (e) {
      console.error("Failed to use template:", e)
      router.push("/create")
    }
  }

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
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {template.free && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          Free
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{template.name}</h3>
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleUseTemplate(template.id)}
                      >
                        Use Template
                      </Button>
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

