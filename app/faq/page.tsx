import { HelpCircle, Sparkles, ArrowRight } from 'lucide-react'
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
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-gray-300">FAQ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-gray-400 text-lg">Everything you need to know about WindVault Market.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all hover:scale-[1.01] group">
              <summary className="cursor-pointer font-bold text-lg flex items-center gap-3">
                <span className="text-purple-400">{String(i + 1).padStart(2, '0')}.</span>
                {faq.question}
              </summary>
              <p className="mt-3 text-gray-400 text-sm pl-8">{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-gray-400 mb-4">Our support team is here 24/7 to help you.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-all">
            Contact Us <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
