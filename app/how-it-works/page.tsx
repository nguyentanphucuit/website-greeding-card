"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Frame, MessageSquare, Paintbrush, Download } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h1>
          <p className="text-xl text-gray-600">
            Making personalized greeting cards is quick and easy!
          </p>
        </div>

        {/* Step 1: Choose a template */}
        <div className="mb-20">
          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                1
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Frame className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a template</h2>
              <p className="text-gray-600">Select from new, suggested greeting card designs</p>
            </div>
          </div>
        </div>

        {/* Step 2: Describe your message */}
        <div className="mb-20">
          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                2
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe your message</h2>
              <p className="text-gray-600">Tell our AI what you want to say and it will help craft the perfect message.</p>
            </div>
          </div>
        </div>

        {/* Step 3: Customize the design */}
        <div className="mb-20">
          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                3
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Paintbrush className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize the design</h2>
              <p className="text-gray-600">Adjust text, colors, and images to match your vision</p>
            </div>
          </div>
        </div>

        {/* Step 4: Download & share */}
        <div className="mb-20">
          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                4
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Download & share</h2>
              <p className="text-gray-600">Instantly download your high-quality image or share your card online.</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 rounded-2xl relative overflow-hidden">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start Creating Beautiful Personalized Cards in Seconds!
            </h2>
            <Link href="/create">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                Create Your Card
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
