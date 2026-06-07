'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Avatar from 'react-avatar'
import { Settings, Shield, LogOut, User, X } from 'lucide-react'

export function UserAvatar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session?.user) return null

  const username = session.user.username || 'User'
  const email = session.user.email || ''

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <Avatar
          name={username}
          size="32"
          round={true}
          className="border-2 border-white"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fade-in">
          <div className="p-4 border-b border-gray-100">
            <p className="font-medium">{username}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/dashboard/profile')
              }}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 transition"
            >
              <User className="w-4 h-4 text-gray-500" /> Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/dashboard/security')
              }}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 transition"
            >
              <Shield className="w-4 h-4 text-gray-500" /> Security (2FA)
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/dashboard/settings')
              }}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 transition"
            >
              <Settings className="w-4 h-4 text-gray-500" /> Settings
            </button>
          </div>
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 transition text-red-600"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
