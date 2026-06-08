import { Sparkles, HelpCircle, Shield, Zap, CreditCard, Truck, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function FAQPage() {
  const faqs = [
    {
      question: 'How do I purchase an item?',
      answer: 'Browse our products, select the one you want, choose your payment method, and complete the checkout process. You\'ll receive your item instantly.'
    },
    {
      question: 'Is my payment secure?',
      answer: 'Yes – all transactions are encrypted with SSL and protected by our advanced fraud detection system.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Most items are delivered instantly after payment confirmation. Some items may take up to 24 hours in rare cases.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept crypto (Coinbase Commerce), PayPal, Western Union, Ria, MoneyGram, and more. All methods are secure.'
    },
    {
      question: 'What if I have a problem with my order?',
      answer: 'Open a support ticket from your dashboard, and our 24/7 support team will help you resolve the issue.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'Yes – we offer a 14-day satisfaction guarantee. If you\'re not happy, contact our support team for a refund.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-20">
      
      {/* ===== BACKGROUND AMBIENCE ===== */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {/* ===== HERO ===== */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">FAQ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-gray-400 text-lg">Everything you need to know about WindVault Market.</p>
        </div>

        {/* ===== FAQ GRID ===== */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all hover:scale-[1.01]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{faq.question}</h3>
                  <p className="text-gray-400 text-sm">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== CTA ===== */}
        <div className="mt-12 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-gray-400 mb-4">Our support team is here 24/7 to help you.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:scale-105 transition-all">
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
