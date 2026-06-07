import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Shield, Smartphone, Globe, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-white">
        <Shield className="w-8 h-8 text-purple-600" />
        Security Settings
      </h1>

      {/* 2FA Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Shield className="w-5 h-5 text-purple-600" />
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add an extra layer of security to your account.
              </p>
            </div>
            {has2FA ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Enabled
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Disabled
              </span>
            )}
          </div>
        </div>
        <div className="p-6 space-y-4">
          {has2FA ? (
            <>
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ 2FA is currently enabled for your account.
                </p>
              </div>

              {/* Devices list */}
              {user.twoFactorDevices.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Smartphone className="w-4 h-4" />
                    Connected Devices
                  </h3>
                  <div className="space-y-2">
                    {user.twoFactorDevices.map((device: any) => (
                      <div key={device.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900 dark:text-white">{device.deviceName}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(device.lastUsedAt).toLocaleString()}
                          </span>
                        </div>
                        {device.ipAddress && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            IP: {device.ipAddress}
                          </p>
                        )}
                        {device.userAgent && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {device.userAgent}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <Link
                  href="/dashboard/security/2fa/setup"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  Manage 2FA
                </Link>
                <form action="/api/auth/2fa/disable" method="POST">
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Disable 2FA
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  2FA is not enabled. Enable it to better protect your account.
                </p>
              </div>
              <Link
                href="/dashboard/security/2fa/setup"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Enable 2FA
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Information</h2>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-gray-900 dark:text-white"><strong>Username:</strong> {user.username}</p>
          <p className="text-gray-900 dark:text-white"><strong>Email:</strong> {user.email}</p>
          <p className="text-gray-900 dark:text-white"><strong>Role:</strong> {user.role}</p>
          <p className="text-gray-900 dark:text-white"><strong>Account created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
