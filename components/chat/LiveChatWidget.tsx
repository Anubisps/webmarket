'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, User, Mail, Sparkles, Phone, XCircle, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

export function LiveChatWidget() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [showLoginForm, setShowLoginForm] = useState(true)
  const [sending, setSending] = useState(false)
  const [lastExpediteTime, setLastExpediteTime] = useState<number | null>(null)
  const [expediteCooldown, setExpediteCooldown] = useState(0)
  const [isEnded, setIsEnded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const processedMessageIds = useRef<Set<string>>(new Set())
  const lastMessageIdRef = useRef<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [visitorId, setVisitorId] = useState<string | null>(null)

  // Load or generate visitor ID on client side only
  useEffect(() => {
    let id = localStorage.getItem('livechat_visitor_id')
    if (!id) {
      id = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('livechat_visitor_id', id)
    }
    setVisitorId(id)
  }, [])

  // If user is logged in, pre-fill name and email
  useEffect(() => {
    if (session?.user) {
      setVisitorName(session.user.username || '')
      setVisitorEmail(session.user.email || '')
      setShowLoginForm(false)
    }
  }, [session])

  // Initialize session
  const initSession = async () => {
    if (!visitorId) return
    const name = session?.user?.username || visitorName || 'Guest'
    const email = session?.user?.email || visitorEmail || ''
    try {
      const res = await fetch('/api/livechat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: visitorId,
          visitorName: name,
          visitorEmail: email
        })
      })
      const data = await res.json()
      if (data.id) {
        setSessionId(data.id)
        setMessages(data.messages || [])
        data.messages?.forEach((msg: any) => processedMessageIds.current.add(msg.id))
        setIsEnded(data.status === 'closed')
        setShowLoginForm(false)
        // ✅ Send auto-welcome message if no messages exist
        if (data.messages?.length === 0) {
          const welcomeMessage = `👋 Welcome ${name}! How can we help you today?`
          try {
            const msgRes = await fetch('/api/livechat/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: data.id,
                sender: 'admin',
                message: welcomeMessage
              })
            })
            if (msgRes.ok) {
              const newMsg = await msgRes.json()
              processedMessageIds.current.add(newMsg.id)
              lastMessageIdRef.current = newMsg.id
              setMessages([newMsg])
            }
          } catch (err) {
            console.error('Failed to send welcome message:', err)
          }
        }
      }
    } catch (err) {
      console.error('Session init error:', err)
    }
  }

  // Poll for new messages
  const pollMessages = async () => {
    if (!sessionId || isEnded) return
    try {
      const lastId = lastMessageIdRef.current || null
      const res = await fetch('/api/livechat/messages/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          lastMessageId: lastId
        })
      })
      const data = await res.json()
      if (data.messages && data.messages.length > 0) {
        const newMessages = data.messages.filter((msg: any) => !processedMessageIds.current.has(msg.id))
        if (newMessages.length > 0) {
          newMessages.forEach((msg: any) => processedMessageIds.current.add(msg.id))
          lastMessageIdRef.current = newMessages[newMessages.length - 1].id
          setMessages(prev => [...prev, ...newMessages])
        }
      }
    } catch (err) {
      console.error('Poll error:', err)
    }
  }

  // Send typing indicator
  const sendTyping = async (typing: boolean) => {
    if (!sessionId || isEnded) return
    try {
      await fetch('/api/livechat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, isTyping: typing })
      })
    } catch (err) {
      // Silently fail
    }
  }

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (!isTyping) {
      setIsTyping(true)
      sendTyping(true)
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTyping(false)
    }, 1000)
  }

  // Send a message
  const sendMessage = async () => {
    if (!input.trim() || !sessionId || isEnded) return
    const msgText = input.trim()
    setInput('')
    setSending(true)
    const tempId = 'temp_' + Date.now()
    processedMessageIds.current.add(tempId)
    const tempMsg = {
      id: tempId,
      sender: 'visitor',
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
          sessionId,
          sender: 'visitor',
          message: msgText
        })
      })
      if (res.ok) {
        const data = await res.json()
        processedMessageIds.current.delete(tempId)
        processedMessageIds.current.add(data.id)
        lastMessageIdRef.current = data.id
        setMessages(prev => prev.map(m => m.id === tempId ? data : m))
      } else {
        processedMessageIds.current.delete(tempId)
        setMessages(prev => prev.filter(m => m.id !== tempId))
        toast.error('Failed to send message')
      }
    } catch (err) {
      processedMessageIds.current.delete(tempId)
      setMessages(prev => prev.filter(m => m.id !== tempId))
      toast.error('Network error')
    } finally {
      setSending(false)
      setIsTyping(false)
      sendTyping(false)
    }
  }

  // ✅ End session – original logic: new visitor ID, reset state, show login form
  const endSession = async () => {
    if (!sessionId) return
    if (!confirm('Are you sure you want to end this chat?')) return
    try {
      await fetch('/api/livechat/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      const newId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      setVisitorId(newId)
      localStorage.setItem('livechat_visitor_id', newId)
      setSessionId(null)
      setMessages([])
      setShowLoginForm(true)
      setIsEnded(false)
      processedMessageIds.current.clear()
      lastMessageIdRef.current = null
      toast.success('Chat ended. Start a new chat anytime.')
    } catch (err) {
      toast.error('Failed to end chat')
    }
  }

  // ✅ Expedite Call – original logic with prompt and cooldown
  const expediteCall = async () => {
    if (!sessionId) return
    const now = Date.now()
    if (lastExpediteTime && now - lastExpediteTime < 600000) {
      toast.error(`Please wait ${Math.ceil((600000 - (now - lastExpediteTime)) / 60000)} minutes before sending another expedite request.`)
      return
    }
    const message = prompt('Optional message for the support team:')
    try {
      const res = await fetch('/api/livechat/expedite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          visitorName: visitorName || 'Guest',
          visitorEmail: visitorEmail || 'Not provided',
          message: message || 'Urgent request from live chat'
        })
      })
      if (res.ok) {
        toast.success('Expedite call sent! Support team will be notified immediately.')
        setLastExpediteTime(now)
        setExpediteCooldown(600)
      } else {
        toast.error('Failed to send expedite call')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  // Countdown timer for expedite button
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (expediteCooldown > 0) {
      timer = setInterval(() => {
        setExpediteCooldown(prev => {
          if (prev <= 1) {
            if (timer) clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [expediteCooldown])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial session setup
  useEffect(() => {
    if (isOpen && !sessionId && visitorId && !showLoginForm) {
      initSession()
    }
  }, [isOpen, visitorId, showLoginForm])

  // Polling interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isOpen && sessionId && !isEnded) {
      interval = setInterval(pollMessages, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isOpen, sessionId, isEnded])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[90vw] h-[600px] max-h-[90vh] bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-fade-in-up">
      <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Support</h3>
            <p className="text-[10px] text-purple-200">Online • Typically replies in 5 min</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {showLoginForm ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Start a conversation</h3>
            <p className="text-gray-400 text-sm mb-6 text-center">Enter your name and email to start chatting with our support team.</p>
            <div className="w-full space-y-3">
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
              />
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
              />
              <button
                onClick={() => {
                  if (visitorName.trim() && visitorEmail.trim()) {
                    setShowLoginForm(false)
                  } else {
                    toast.error('Please fill in both fields')
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.02] transition-all"
              >
                Start Chat
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
              {isEnded ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <XCircle className="w-16 h-16 mb-2 opacity-50" />
                  <p className="text-sm">Chat ended</p>
                  <button onClick={() => setShowLoginForm(true)} className="mt-4 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all">
                    Start a new chat
                  </button>
                </div>
              ) : (
                <>
                  {/* ✅ Notice Block */}
                  {!isEnded && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3 flex items-start gap-2 text-yellow-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>
                        In case we don't reply to your messages within 5 minutes, please use the 
                        <strong className="text-yellow-400"> Expedite Call</strong> button below to ring our office!
                      </p>
                    </div>
                  )}
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-pulse">
                        <MessageCircle className="w-12 h-12 opacity-50" />
                      </div>
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs text-gray-500">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'admin' ? 'bg-white/10 text-gray-200' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'}`}>
                          {msg.message}
                          <div className="text-[10px] mt-1 opacity-50">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {!isEnded && (
              <div className="p-4 border-t border-white/10 shrink-0 bg-[#0f0f1a]">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    value={input}
                    onChange={handleInputChange}
                    disabled={sending}
                  />
                  <button type="submit" className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50" disabled={sending}>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                <div className="flex gap-2 mt-2">
                  <button onClick={expediteCall} disabled={expediteCooldown > 0} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Phone className="w-3 h-3" />
                    {expediteCooldown > 0 ? `Wait ${Math.ceil(expediteCooldown / 60)}m` : 'Expedite Call'}
                  </button>
                  <button onClick={endSession} className="flex-1 py-2 rounded-xl bg-white/10 border border-white/10 text-gray-400 text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" /> End Chat
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
