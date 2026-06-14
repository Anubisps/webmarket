'use client'
import { useState, useEffect } from 'react'

interface Faq {
  id: string
  question: string
  answer: string
}

interface FaqAccordionProps {
  faqs: Faq[]
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredFaqs, setFilteredFaqs] = useState(faqs)

  useEffect(() => {
    const handleSearch = () => {
      const input = document.getElementById('faq-search') as HTMLInputElement
      const searchHandler = () => {
        setSearchTerm(input.value.toLowerCase())
      }
      input?.addEventListener('input', searchHandler)
      return () => input?.removeEventListener('input', searchHandler)
    }
    handleSearch()
  }, [])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredFaqs(faqs)
    } else {
      setFilteredFaqs(
        faqs.filter(
          faq =>
            faq.question.toLowerCase().includes(searchTerm) ||
            faq.answer.toLowerCase().includes(searchTerm)
        )
      )
    }
  }, [searchTerm, faqs])

  if (filteredFaqs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No results found for "{searchTerm}"</p>
        <button
          onClick={() => {
            const input = document.getElementById('faq-search') as HTMLInputElement
            if (input) input.value = ''
            setSearchTerm('')
          }}
          className="mt-4 px-4 py-2 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
        >
          Clear Search
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredFaqs.map(faq => (
        <div
          key={faq.id}
          className="group bg-white/5 rounded-2xl border border-white/10 transition-all duration-300 hover:border-purple-500/30 hover:bg-white/10"
        >
          <button
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            className="w-full text-left p-6 flex justify-between items-center gap-4"
          >
            <h3 className="text-lg font-semibold group-hover:text-purple-400 transition-colors">
              {faq.question}
            </h3>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                openId === faq.id ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openId === faq.id ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <div className="p-6 pt-0 text-gray-300 leading-relaxed border-t border-white/10 mt-2">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
