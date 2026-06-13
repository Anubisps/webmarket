import Link from 'next/link'
import { Shield, CheckCircle, Award, AlertCircle, HeartHandshake, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
              Terms of Service
            </h1>
          </div>

          <p className="text-gray-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-400" />
                1. Satisfaction Guarantee & Warranty
              </h2>
              <p className="leading-relaxed">
                WindVault Market provides a <span className="font-bold text-white">full warranty on all services</span> until you, the customer, 
                are completely satisfied. If at any point during or after the delivery you are not satisfied, we will work to resolve the issue 
                or provide a full refund. The warranty period ends only when you confirm satisfaction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                2. Safety & Security Guarantee
              </h2>
              <p className="leading-relaxed">
                We guarantee that your purchase is safe and legitimate. All products sold on our marketplace are verified for authenticity and 
                functionality. Once you confirm satisfaction, you have our assurance that the service will not cause any harm, bans, or issues 
                to your account or device. If anything goes wrong after satisfaction, we will still assist as a courtesy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                3. Delivery & Timelines
              </h2>
              <p className="leading-relaxed">
                Most products are delivered instantly after payment confirmation. If a delay occurs, you will be notified. You may request a 
                full refund at any time before delivery if the wait exceeds the stated estimated time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                4. Dispute Resolution
              </h2>
              <p className="leading-relaxed">
                In the rare event of an issue, you can open a support ticket. Our team will prioritize your case and resolve it within 24 hours. 
                If we cannot resolve the issue to your satisfaction, you are entitled to a full refund regardless of time passed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. No Liability After Satisfaction</h2>
              <p className="leading-relaxed">
                Once you have confirmed satisfaction, WindVault Market is released from any further liability, because we have fulfilled our 
                warranty obligation. However, we remain available for any post‑satisfaction questions or minor assistance as a sign of good faith.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Changes to Terms</h2>
              <p className="leading-relaxed">
                We may update these terms. Continued use after changes implies acceptance. If you disagree, you may request account closure 
                (which is immediate and complete due to our no‑data retention policy).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
              <p className="leading-relaxed">
                For any questions, open a support ticket from your dashboard – our team will respond anonymously and promptly.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-500">
            <p>WindVault Market – Your Satisfaction, Our Guarantee</p>
          </div>
        </div>
      </div>
    </div>
  )
}
