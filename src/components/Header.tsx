import Link from 'next/link'

export default function Header() {
  return (
    <header className="w-full border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Broadway Helper
          </Link>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link href="/real-compare" className="hover:text-primary font-semibold text-green-600">
                Real Prices
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-primary text-gray-600">
                Data Entry
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}