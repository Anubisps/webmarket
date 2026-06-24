'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Mail, X, Loader2 } from 'lucide-react'

export function EmailVerifyBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)

  if (dismissed) return null

  const sendCode = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/resend-verification', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        toast.success('Verification code sent to your email')
      } else {
        toast.error(data.error || 'Failed to send email')
      }
    } finally {
      setLoading(false)
    }
  }

  const verify = async () => {
    if (!code.trim()) return
    setVerifying(true)
    try {
      const res = await fetch('/api/user/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code.trim() }),
      })
      if (res.ok) {
        toast.success('Email verified!')
        window.location.reload()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Invalid code')
      }
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-bold text-amber-200">Verify your email (optional)</p>
            <p className="mt-1 text-sm text-gray-300">
              Confirming your email helps with order updates and account recovery. You can keep using WindVault without verifying.
            </p>
            {sent && (
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="6-digit code"
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                  maxLength={6}
                />
                <button
                  onClick={verify}
                  disabled={verifying}
                  className="rounded-xl bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30 disabled:opacity-50"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {!sent && (
            <button
              onClick={sendCode}
              disabled={loading}
              className="rounded-xl bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send code'}
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="rounded-xl p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
