import Link from 'next/link'
import data from '../../../initial-data.json'

export default function ShowsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">All Shows</h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.shows.map((show) => (
              <Link key={show.slug} href={`/shows/${show.slug}`}>
                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
                  <h2 className="text-2xl font-semibold text-purple-600 mb-2">{show.name}</h2>
                  <p className="text-gray-600 mb-4">at {show.theater}</p>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">Fun Fact:</p>
                    <p className="text-gray-700 text-sm">{show.fun_fact}</p>
                  </div>
                  
                  <div className="mt-4 text-purple-600 font-medium hover:text-purple-700">
                    View Details →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}