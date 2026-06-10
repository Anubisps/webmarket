'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, User, Mail, Shield, CheckCircle, XCircle, AlertCircle, Edit, Ban, Unlock, Save, Box } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ManageUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  const [banLoading, setBanLoading] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
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

  const csrfToken = document.cookie
    .split(';')
    .find(c => c.trim().startsWith('csrf_token='))
    ?.split('=')[1]

  try {
    const res = await fetch(`/api/admin/users/${id}/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || ''
      },
      body: JSON.stringify(editForm)
    })

    if (res.ok) {
      // ✅ Redirect to the users list – no loop
      toast.success('User updated successfully')
      setTimeout(() => {
        router.push('/accessadmin/users')
      }, 500)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to update user')
    }
  } catch (err) {
    setError('Network error – please try again')
  } finally {
    setEditLoading(false)
  }
}

  if (loading) return <div className="p-8 text-center text-gray-400">Loading user...</div>
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <Link href="/accessadmin/users" className="text-purple-400 hover:underline">← Back to Users</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">User</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Manage <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{user.username}</span>
          </h1>
          <p className="text-gray-400 text-lg">Update user details and permissions.</p>
        </div>
        <Link
          href="/accessadmin/users"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all mt-4 md:mt-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
      </div>

      {/* ===== ALERTS ===== */}
      {success && <p className="text-emerald-400 mb-4">{success}</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* ===== USER INFO CARD ===== */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Box className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold">User Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Username
            </p>
            <p className="font-medium text-lg">{user.username}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </p>
            <p className="font-medium text-lg">{user.email}</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-sm text-gray-400">Role</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
              user.role === 'manager' ? 'bg-purple-500/20 text-purple-400' :
              user.role === 'support' ? 'bg-blue-500/20 text-blue-400' :
              user.role === 'processor' ? 'bg-orange-500/20 text-orange-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {user.role}
            </span>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-sm text-gray-400">Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.banned ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {user.banned ? 'Banned' : 'Active'}
            </span>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-sm text-gray-400">2FA</p>
            {user.twoFactorSecret ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <Shield className="w-4 h-4" /> Enabled
              </span>
            ) : (
              <span className="flex items-center gap-2 text-gray-400">
                <XCircle className="w-4 h-4" /> Disabled
              </span>
            )}
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-sm text-gray-400">Verified</p>
            {user.isVerified ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-2 text-gray-400">
                <XCircle className="w-4 h-4" /> Unverified
              </span>
            )}
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-sm text-gray-400">Joined</p>
            <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* ===== ACTIONS CARD ===== */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold">Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={toggleBan}
            disabled={banLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all ${
              user.banned
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-red-600 to-pink-600 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]'
            } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {banLoading ? 'Updating...' : user.banned ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            {user.banned ? 'Unban' : 'Ban'}
          </button>
          <button
            onClick={toggleVerify}
            disabled={verifyLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all ${
              user.isVerified
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
            } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {verifyLoading ? 'Updating...' : user.isVerified ? 'Unverify' : 'Verify'}
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 transition-all"
          >
            <Edit className="w-4 h-4" />
            {editMode ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* ===== EDIT PROFILE FORM ===== */}
      {editMode && (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Edit className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold">Edit Profile</h2>
          </div>
          <form onSubmit={handleEditProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={editForm.username}
                onChange={e => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={editLoading}
              className="md:col-span-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      )}

      {/* ===== CHANGE ROLE CARD ===== */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold">Change Role</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['user', 'admin', 'manager', 'support', 'processor'].map(role => (
            <button
              key={role}
              onClick={() => changeRole(role)}
              disabled={roleLoading || user.role === role}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                user.role === role
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
