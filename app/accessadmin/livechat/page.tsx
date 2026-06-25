'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Sparkles, Box, User, Send, Clock, ArrowLeft, XCircle, Trash2, Globe, Activity, Bell, CheckCircle, CheckCheck, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { LiveChatMessageBody } from '@/components/chat/LiveChatMessageBody'
import { csrfHeaders } from '@/lib/csrfClient'
import {
  alertLiveChatReply,
  initLiveChatTabTitle,
  resetLiveChatTabTitle,
  setupLiveChatTabReset,
  unlockLiveChatAudio,
} from '@/lib/livechatNotifications'

interface ChatSession {
  id: string
  visitorId: string
  visitorName: string
  visitorEmail: string
  ipAddress: string | null
  status: string
  isTyping: boolean
  createdAt: string
  updatedAt: string
  unreadCount: number
  messages: any[]
}

export default function AdminLiveChatPage() {
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([])
  const [closedSessions, setClosedSessions] = useState<ChatSession[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<Record<string, string>>({})
  const selectedIdRef = useRef<string | null>(null)
  const didAutoSelectRef = useRef(false)
  const prevUnreadBySessionRef = useRef<Record<string, number>>({})
  const sessionsInitializedRef = useRef(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    initLiveChatTabTitle('Live Chat — WindVault Admin')
    const cleanup = setupLiveChatTabReset()
    return cleanup
  }, [])

  useEffect(() => {
    const unlock = () => unlockLiveChatAudio()
    window.addEventListener('click', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('click', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  const scrollMessagesToBottom = () => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }

  const loadSessions = async () => {
    try {
      const [activeRes, closedRes] = await Promise.all([
        fetch('/api/admin/livechat/sessions'),
        fetch('/api/admin/livechat/sessions/closed')
      ])
      const activeData = await activeRes.json()
      const closedData = await closedRes.json()

      if (!didAutoSelectRef.current && !selectedIdRef.current) {
        const firstUnread = activeData.find((s: ChatSession) => s.unreadCount > 0)
        if (firstUnread) {
          setSelectedId(firstUnread.id)
          toast.success(`New message from ${firstUnread.visitorName || 'Guest'}`)
        } else if (activeData.length > 0) {
          setSelectedId(activeData[0].id)
        }
        didAutoSelectRef.current = true
      }

      setActiveSessions(activeData)
      setClosedSessions(closedData)

      if (sessionsInitializedRef.current) {
        for (const session of activeData) {
          const previousUnread = prevUnreadBySessionRef.current[session.id] || 0
          if (session.unreadCount > previousUnread && session.id !== selectedIdRef.current) {
            alertLiveChatReply(`Message from ${session.visitorName || 'Guest'}`)
            break
          }
        }
      } else {
        sessionsInitializedRef.current = true
      }

      prevUnreadBySessionRef.current = Object.fromEntries(
        activeData.map((session: ChatSession) => [session.id, session.unreadCount])
      )
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (sessionId: string) => {
    setLoadingMessages(true)
    setMessages([])
    try {
      const res = await fetch(`/api/admin/livechat/sessions/${sessionId}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setMessages(data.messages || [])
      if (data.messages && data.messages.length > 0) {
        lastMessageIdRef.current[sessionId] = data.messages[data.messages.length - 1].id
      } else {
        delete lastMessageIdRef.current[sessionId]
      }
      setActiveSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, unreadCount: 0 } : s
      ))
    } catch (err) {
      toast.error('Failed to load messages')
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const selectSession = (sessionId: string) => {
    if (sessionId === selectedId) return
    setSelectedId(sessionId)
    setMessages([])
    delete lastMessageIdRef.current[sessionId]
    resetLiveChatTabTitle()
  }

  const sendMessage = async () => {
    if (!input.trim() || !selectedId) return
    const msgText = input.trim()
    setInput('')
    setSending(true)
    const tempMsg = {
      id: 'temp_' + Date.now(),
      sender: 'admin',
      message: msgText,
      status: 'sent',
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res = await fetch('/api/livechat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedId,
          sender: 'admin',
          message: msgText
        })
      })
      if (res.ok) {
        const data = await res.json()
        lastMessageIdRef.current[selectedId] = data.id
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m))
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
        toast.error('Failed to send')
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
      toast.error('Network error')
    } finally {
      setSending(false)
    }
  }

  const deleteSession = async (id: string) => {
    if (!confirm('Delete this session permanently?')) return
    try {
      const res = await fetch(`/api/admin/livechat/sessions/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Session deleted')
        setClosedSessions(prev => prev.filter(s => s.id !== id))
        if (selectedId === id) {
          setSelectedId(null)
          setMessages([])
        }
      } else {
        toast.error('Failed to delete session')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  const escalateToTicket = async (id: string) => {
    try {
      const res = await fetch('/api/admin/livechat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify({ sessionId: id }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Escalated to ticket')
        window.location.href = `/accessadmin/tickets/${data.ticketId}`
      } else toast.error(data.error || 'Escalation failed')
    } catch {
      toast.error('Network error')
    }
  }

  const closeSession = async (id: string) => {
    try {
      const res = await fetch(`/api/livechat/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id })
      })
      if (res.ok) {
        await loadSessions()
        if (selectedId === id) {
          setSelectedId(null)
          setMessages([])
        }
        toast.success('Session closed')
      } else {
        toast.error('Failed to close session')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  const pollMessages = async () => {
    if (!selectedId || loadingMessages) return
    try {
      const lastId = lastMessageIdRef.current[selectedId] || null
      const res = await fetch('/api/livechat/messages/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedId,
          lastMessageId: lastId
        })
      })
      const data = await res.json()
      if (data.messages && data.messages.length > 0) {
        const visitorMessages = data.messages.filter((msg: { sender: string }) => msg.sender === 'visitor')
        if (visitorMessages.length > 0) {
          alertLiveChatReply('New visitor reply')
        }

        lastMessageIdRef.current[selectedId] = data.messages[data.messages.length - 1].id
        setMessages(prev => [...prev, ...data.messages])
      }
    } catch (err) {
      console.error('Poll error:', err)
    }
  }

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId)
    } else {
      setMessages([])
    }
  }, [selectedId])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (selectedId && !loadingMessages) {
      interval = setInterval(pollMessages, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [selectedId, loadingMessages])

  useEffect(() => {
    scrollMessagesToBottom()
  }, [messages, loadingMessages])

  useEffect(() => {
    loadSessions()
    const interval = setInterval(loadSessions, 2000)
    return () => clearInterval(interval)
  }, [])

  const formatDateTime = (value: string) => {
    const date = new Date(value)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const formatTime = (value: string) => {
    const date = new Date(value)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading live chat...</div>

  const currentSessions = activeTab === 'active' ? activeSessions : closedSessions
  const selectedSession = currentSessions.find(s => s.id === selectedId)

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-3 h-3 text-gray-500" />
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-400" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col h-screen">
      <div className="flex-none p-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
              <MessageCircle className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-gray-300">Live Chat</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Live</span> Chat
            </h1>
            <p className="text-gray-400 text-lg">{activeSessions.length} active session(s)</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-1" />
            Active ({activeSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'closed'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            Closed ({closedSessions.length})
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 min-h-0">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden h-full flex flex-col">
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/3 border-r border-white/10 overflow-y-auto flex flex-col h-full">
              <div className="p-4 border-b border-white/10 shrink-0">
                <h2 className="font-bold text-lg mb-2">{activeTab === 'active' ? 'Active Chats' : 'Closed Chats'}</h2>
                <p className="text-xs text-gray-400">{currentSessions.length} session(s)</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {currentSessions.length === 0 ? (
                  <div className="p-8 text-center">
                    <Box className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400 text-sm">No {activeTab} chats</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {currentSessions.map(session => {
                      const hasUnread = activeTab === 'active' && session.unreadCount > 0
                      const isTyping = session.isTyping
                      return (
                        <button
                          key={session.id}
                          onClick={() => selectSession(session.id)}
                          className={`w-full text-left p-4 transition-colors hover:bg-white/5 ${
                            selectedId === session.id ? 'bg-white/10' : ''
                          } ${hasUnread ? 'bg-blue-500/5' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`${hasUnread ? 'font-bold' : 'font-medium'} text-sm truncate text-white`}>
                                  {session.visitorName || 'Guest'}
                                </p>
                                {isTyping && (
                                  <span className="flex items-center gap-1 text-xs text-green-400 animate-pulse">
                                    <Pencil className="w-3 h-3" /> typing...
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs truncate ${hasUnread ? 'text-gray-300' : 'text-gray-500'}`}>
                                {session.visitorEmail || 'No email'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {session.ipAddress || 'Unknown IP'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(session.updatedAt)}
                              </p>
                            </div>
                            {hasUnread && (
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                                {session.unreadCount > 9 ? '9+' : session.unreadCount}
                              </span>
                            )}
                            {activeTab === 'closed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteSession(session.id)
                                }}
                                className="p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col h-full bg-black/20">
              {selectedSession ? (
                <>
                  <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="text-lg font-bold">{selectedSession.visitorName || 'Guest'}</h2>
                      <p className="text-xs text-gray-400">{selectedSession.visitorEmail || 'No email'}</p>
                      <p className="text-xs text-gray-500">{selectedSession.ipAddress || 'Unknown IP'}</p>
                      {selectedSession.isTyping && (
                        <p className="text-xs text-green-400 flex items-center gap-1 animate-pulse">
                          <Pencil className="w-3 h-3" /> typing...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {formatDateTime(selectedSession.updatedAt)}
                      </span>
                      {activeTab === 'active' && (
                        <>
                          <button
                            onClick={() => escalateToTicket(selectedSession.id)}
                            className="rounded-lg bg-violet-500/15 px-2 py-1 text-xs text-violet-300 hover:bg-violet-500/25"
                          >
                            Escalate to ticket
                          </button>
                          <button
                            onClick={() => closeSession(selectedSession.id)}
                            className="p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
                    {loadingMessages ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-sm">Loading messages...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-xl text-sm ${
                              msg.sender === 'admin'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-white/10 text-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <LiveChatMessageBody msg={msg} />
                              {msg.sender === 'admin' && (
                                <span className="shrink-0">
                                  {getMessageStatusIcon(msg.status)}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] mt-1 opacity-50 flex items-center gap-1">
                              {formatTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {activeTab === 'active' && (
                    <div className="p-4 border-t border-white/10 shrink-0">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          sendMessage()
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle className="w-16 h-16 mb-4 text-gray-600" />
                  <p className="text-lg">Select a chat to respond</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
