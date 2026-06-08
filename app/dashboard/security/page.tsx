import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Shield, Smartphone, Globe, Clock, CheckCircle, XCircle, AlertCircle, Box, ArrowRight, User, Mail, Lock } from 'lucide-react'

export default async function SecurityPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      twoFactorDevices: {
        orderBy: { lastUsedAt: 'desc' }
      }
    }
  })

  if (!user) redirect('/login')

  const has2FA = user.twoFactorSecret !== null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-12">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {/* ===== BACKGROUND AMBIENCE ===== */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
              <Shield className="w-8 h-8 inline mr-2 text-purple-400" />
              Security <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-gray-400 text-lg">Manage your account security and 2FA.</p>
          </div>
        </div>

        {/* ===== 2FA CARD ===== */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-6 relative z-10 hover:border-purple-500/30 transition-all">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
              </div>
              <p className="text-gray-400 text-sm">Add an extra layer of security to your account.</p>
            </div>
            {has2FA ? (
              <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Enabled
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Disabled
              </span>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
            {has2FA ? (
              <>
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                  <p className="text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    2FA is currently enabled for your account.
                  </p>
                </div>
                {/* Devices list */}
                {user.twoFactorDevices.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-300">
                      <Smartphone className="w-4 h-4" />
                      Connected Devices
                    </h3>
                    <div className="space-y-2">
                      {user.twoFactorDevices.map((device: any) => (
                        <div key={device.id} className="bg-black/30 rounded-xl p-3 text-sm border border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white">{device.deviceName}</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(device.lastUsedAt).toLocaleString()}
                            </span>
                          </div>
                          {device.ipAddress && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              IP: {device.ipAddress}
                            </p>
                          )}
                          {device.userAgent && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {device.userAgent}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-4 mt-4">
                  <Link href="/dashboard/security/2fa/setup" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all">
                    Manage 2FA
                  </Link>
                  <form action="/api/auth/2fa/disable" method="POST">
                    <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/30 hover:scale-105 transition-all">
                      Disable 2FA
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                  <p className="text-sm text-yellow-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    2FA is not enabled. Enable it to better protect your account.
                  </p>
                </div>
                <Link href="/dashboard/security/2fa/setup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all">
                  Enable 2FA
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ===== ACCOUNT INFO CARD ===== */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 relative z-10 hover:border-purple-500/30 transition-all">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-purple-400" />
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">Username</p>
              <p className="text-lg font-medium">{user.username}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">Role</p>
              <p className="text-lg font-medium capitalize">{user.role}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">Account Created</p>
              <p className="text-lg font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
