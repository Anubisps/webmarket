import Link from 'next/link'
import { Shield, Lock, Eye, Trash2, UserX, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>

          <p className="text-gray-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-400" />
                1. No Personal Data Collection
              </h2>
              <p className="leading-relaxed">
                WindVault Market does <span className="font-bold text-white">not</span> collect any personal identifiable information from our users. 
                You are not required to provide your real name, address, phone number, or any other personal data to use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                2. Anonymous Purchases
              </h2>
              <p className="leading-relaxed">
                All purchases on WindVault Market are completely anonymous. We do not link transactions to any personal identity. 
                Your payment information is processed through secure third‑party providers, and we never store your payment details on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                3. No Data Sharing
              </h2>
              <p className="leading-relaxed">
                We never share, sell, or trade any information with third parties. Since we collect no personal data, there is nothing to share. 
                Your anonymity is guaranteed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-yellow-400" />
                4. Automatic Data Deletion (60 Days)
              </h2>
              <p className="leading-relaxed">
                Any minimal technical data required for order processing (such as order ID, transaction hash, and delivery status) is automatically 
                and permanently deleted from our systems <span className="font-bold text-white">60 days</span> after the service is marked as satisfied. 
                This ensures stability, security, and complete privacy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights & Security</h2>
              <p className="leading-relaxed">
                Because we do not store personal data, you retain complete control over your anonymity. If you have any concerns, 
                please contact us through our anonymous support ticket system.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-500">
            <p>WindVault Market – 100% Anonymous • No Tracking • No Sharing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
