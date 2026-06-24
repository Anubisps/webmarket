'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User,
  Shield,
  XCircle,
  Calendar,
  ArrowRight,
  Trash2,
  Box,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  banned: boolean
  twoFactorSecret: string | null
  createdAt: string | Date
}

export function UsersTable({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUser[]
  currentUserId: string
}) {
  const [users, setUsers] = useState(initialUsers)
  const [deleting, setDeleting] = useState<string | null>(null)

  const deleteUser = async (user: AdminUser) => {
    const confirmed = confirm(
      `Delete user "${user.username}" (${user.email})?\n\nThis will permanently remove their account, orders, tickets, and all related data. This action cannot be undone.`
    )
    if (!confirmed) return

    setDeleting(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id))
        toast.success(`User "${user.username}" deleted`)
      } else {
        toast.error(data.error || 'Failed to delete user')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/30">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Username</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Email</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Role</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">2FA</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Joined</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  <Box className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                  <p>No users found</p>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    {u.username}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-red-500/20 text-red-400'
                          : u.role === 'manager'
                            ? 'bg-purple-500/20 text-purple-400'
                            : u.role === 'support'
                              ? 'bg-blue-500/20 text-blue-400'
                              : u.role === 'processor'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.banned
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {u.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.twoFactorSecret ? (
                      <Shield className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/accessadmin/users/${u.id}`}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                      >
                        Manage <ArrowRight className="w-3 h-3" />
                      </Link>
                      {u.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => deleteUser(u)}
                          disabled={deleting === u.id}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete user"
                        >
                          <Trash2 className="w-3 h-3" />
                          {deleting === u.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
