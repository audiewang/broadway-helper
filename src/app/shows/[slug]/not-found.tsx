import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Show Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn&apos;t find the show you&apos;re looking for. It might have been removed or the link might be incorrect.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  )
}