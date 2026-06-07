'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ManageUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  
  // Loading states for different actions
  const [banLoading, setBanLoading] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  
  // Edit profile form
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ username: '', email: '' })

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('User not found')
        return res.json()
      })
      .then(data => {
        setUser(data)
        setEditForm({ username: data.username, email: data.email })
        setLoading(false)
      })
      .catch(err => {
        setError('User not found')
        setLoading(false)
      })
  }, [id])

  const toggleBan = async () => {
    setBanLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned: !user.banned })
      })
      if (res.ok) {
        const updated = await res.json()
        setUser(updated)
        setSuccess(`User ${updated.banned ? 'banned' : 'unbanned'} successfully`)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update ban status')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setBanLoading(false)
    }
  }

  const changeRole = async (role: string) => {
    setRoleLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      if (res.ok) {
        const updated = await res.json()
        setUser(updated)
        setSuccess(`Role changed to ${updated.role}`)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to change role')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setRoleLoading(false)
    }
  }

  const toggleVerify = async () => {
    setVerifyLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/users/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !user.isVerified })
      })
      if (res.ok) {
        const updated = await res.json()
        setUser(updated)
        setSuccess(`User ${updated.isVerified ? 'verified' : 'unverified'} successfully`)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update verification status')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/users/${id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        const updated = await res.json()
        setUser(updated)
        setEditMode(false)
        setSuccess('Profile updated successfully')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setEditLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading user...</div>
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <Link href="/accessadmin/users" className="text-purple-600 hover:underline">← Back to Users</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage User: {user.username}</h1>
        <Link href="/accessadmin/users" className="text-purple-600 hover:underline">← Back to Users</Link>
      </div>

      {success && <p className="text-green-500 mb-4">{success}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
        {/* User Information */}
        <div>
          <h2 className="text-xl font-bold mb-2">User Information</h2>
          <div className="space-y-1 text-gray-700">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.banned ? '🔴 Banned' : '🟢 Active'}</p>
            <p><strong>Verified:</strong> {user.isVerified ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleBan}
              disabled={banLoading}
              className={`px-4 py-2 rounded-lg text-white ${
                user.banned
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {banLoading ? 'Updating...' : user.banned ? 'Unban User' : 'Ban User'}
            </button>
            <button
              onClick={toggleVerify}
              disabled={verifyLoading}
              className={`px-4 py-2 rounded-lg text-white ${
                user.isVerified
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {verifyLoading ? 'Updating...' : user.isVerified ? 'Unverify User' : 'Verify User'}
            </button>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {editMode ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {editMode && (
          <div className="border-t pt-4">
            <h2 className="text-xl font-bold mb-2">Edit Profile</h2>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={editLoading}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {editLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Change Role */}
        <div className="border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Change Role</h2>
          <div className="flex flex-wrap gap-2">
            {['user', 'admin', 'manager', 'support', 'processor'].map(role => (
              <button
                key={role}
                onClick={() => changeRole(role)}
                disabled={roleLoading || user.role === role}
                className={`px-3 py-1 rounded text-sm ${
                  user.role === role
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
