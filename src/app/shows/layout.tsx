import Link from 'next/link'

export default function ShowsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <span className="mr-2">←</span> Back to Home
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </>
  )
}