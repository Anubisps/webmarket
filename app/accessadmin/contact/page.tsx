'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Sparkles, Box, CheckCircle, XCircle, Clock, User, MessageSquare, Eye, ArrowLeft, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/admin/contact')
      const data = await res.json()
      setMessages(data)
      setUnreadCount(data.filter((m: ContactMessage) => !m.isRead).length)
      // Auto-select first unread message, or first message if all read
      const firstUnread = data.find((m: ContactMessage) => !m.isRead)
      if (firstUnread) {
        setSelectedId(firstUnread.id)
      } else if (data.length > 0) {
        setSelectedId(data[0].id)
      }
    } catch (err) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, { method: 'PATCH' })
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
        setUnreadCount(prev => Math.max(0, prev - 1))
        toast.success('Marked as read')
        // Trigger sidebar badge refresh via custom event
        window.dispatchEvent(new Event('contact-update'))
      } else {
        toast.error('Failed to mark as read')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return
    try {
      const res = await fetch(`/api/admin/contact/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id))
        if (selectedId === id) {
          const remaining = messages.filter(m => m.id !== id)
          setSelectedId(remaining.length > 0 ? remaining[0].id : null)
        }
        toast.success('Message deleted')
        window.dispatchEvent(new Event('contact-update'))
      } else {
        toast.error('Failed to delete message')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  const selectedMessage = messages.find(m => m.id === selectedId)

  if (loading) return <div className="p-8 text-center text-gray-400">Loading messages...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-gray-300">Contact</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Contact <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Messages</span>
          </h1>
          <p className="text-gray-400 text-lg">
            {unreadCount > 0 ? (
              <span className="text-yellow-400">You have {unreadCount} unread message(s)</span>
            ) : (
              'All messages read'
            )}
          </p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* LEFT PANEL – Message List */}
          <div className="w-full md:w-1/3 border-r border-white/10 overflow-y-auto max-h-[600px] md:max-h-none">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-bold text-lg mb-2">Inbox</h2>
              <p className="text-xs text-gray-400">{messages.length} messages</p>
            </div>
            {messages.length === 0 ? (
              <div className="p-8 text-center">
                <Box className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400 text-sm">No messages yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {messages.map(msg => {
                  const isUnread = !msg.isRead
                  return (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedId(msg.id)}
                      className={`w-full text-left p-4 transition-colors hover:bg-white/5 ${
                        selectedId === msg.id ? 'bg-white/10' : ''
                      } ${isUnread ? 'bg-blue-500/5' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`${isUnread ? 'font-bold' : 'font-medium'} text-sm truncate text-white`}>
                            {msg.name}
                          </p>
                          <p className={`text-xs truncate ${isUnread ? 'text-gray-300' : 'text-gray-500'}`}>
                            {msg.message.slice(0, 60)}{msg.message.length > 60 ? '...' : ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-2"></span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT PANEL – Message Detail */}
          <div className="w-full md:w-2/3 p-6 bg-black/20 min-h-[300px]">
            {selectedMessage ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button
                        onClick={() => setSelectedId(null)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <h2 className="text-xl font-bold">Message Details</h2>
                  </div>
                  <div className="flex gap-2">
                    {!selectedMessage.isRead && (
                      <button
                        onClick={() => markAsRead(selectedMessage.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                      >
                        <Eye className="w-3 h-3" /> Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <User className="w-4 h-4" /> From
                      </p>
                      <p className="font-medium">{selectedMessage.name}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </p>
                      <p className="font-medium">{selectedMessage.email}</p>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Received
                    </p>
                    <p className="text-sm">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Message
                    </p>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Status:</span>
                    {selectedMessage.isRead ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-sm">
                        <CheckCircle className="w-4 h-4" /> Read
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-400 text-sm">
                        <XCircle className="w-4 h-4" /> Unread
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Box className="w-16 h-16 mb-4 text-gray-600" />
                <p className="text-lg">Select a message to view its content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
