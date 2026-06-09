import Link from 'next/link'
import { ArrowRight, Shield, Zap, Clock, Sparkles, Box, Star, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-20">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">About Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            We Are <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">WindVault</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The premier 3rd-party gaming marketplace built for security, speed, and user experience.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Box className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">Our Mission</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            WindVault Market was created to solve the problem of insecure, slow, and unreliable gaming marketplaces. 
            We combine state-of-the-art encryption, instant delivery, and a 24/7 support team to give you the 
            best possible experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold">10k+</p>
            <p className="text-gray-400 text-sm">Happy Users</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold">99.9%</p>
            <p className="text-gray-400 text-sm">Uptime Guarantee</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-gray-400 text-sm">Expert Support</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to experience the difference?</h2>
          <p className="text-gray-400 mb-4">Join thousands of gamers who trust WindVault Market.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
