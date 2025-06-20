'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  return (
    <section className="relative w-full py-20 px-4 bg-gradient-to-b from-purple-900 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welcome to Broadway Helper
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-purple-100">
          Your ultimate guide to Broadway shows, tickets, and insider tips
        </p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for shows, theaters, or tips..."
              className="w-full px-6 py-4 pr-14 text-lg rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-300"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Find Shows</h3>
            <p className="text-purple-200">Browse current Broadway productions and schedules</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Compare Prices</h3>
            <p className="text-purple-200">Get the best deals on tickets across all theaters</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Expert Tips</h3>
            <p className="text-purple-200">Learn insider secrets for the best Broadway experience</p>
          </div>
        </div>
      </div>
    </section>
  )
}