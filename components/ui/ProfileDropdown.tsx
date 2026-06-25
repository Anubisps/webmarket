'use client'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { User, Shield, LogOut, Settings, Bell } from 'lucide-react'
import { UnreadBadge } from '@/components/ui/UnreadBadge'

export function ProfileDropdown() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load photo from localStorage
    const storedPhoto = localStorage.getItem('profile_photo')
    if (storedPhoto) {
      setPhotoUrl(storedPhoto)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session) return null

  const username = session.user?.username || session.user?.email?.split('@')[0] || 'User'
  const role = session.user?.role || 'user'
  const firstLetter = username.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1 hover:scale-105 transition shadow-md"
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-600 font-bold text-sm overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            firstLetter
          )}
        </div>
        <span className="hidden sm:inline font-medium text-gray-900">{username}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-medium text-gray-900">{username}</p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
          <div className="p-2">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="relative flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-900"
            >
              <Bell className="w-4 h-4" />
              Notifications
              <UnreadBadge className="ml-auto static" />
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-900"
            >
              <Settings className="w-4 h-4" />
              Profile Settings
            </Link>
            <Link
              href="/dashboard/security"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-900"
            >
              <Shield className="w-4 h-4" />
              Security Settings
            </Link>
          </div>
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => {
                setOpen(false)
                window.location.href = '/api/auth/signout'
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition w-full text-left text-red-600 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
