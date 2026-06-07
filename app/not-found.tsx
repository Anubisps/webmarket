import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
          Go Home
        </Link>
      </div>
    </div>
  )
}
