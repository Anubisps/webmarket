import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
}

export function Button({ children, href, onClick, className = '' }: ButtonProps) {
  if (href) {
    return (
      <a href={href} className={`bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition ${className}`}>
        {children}
      </a>
    )
  }
  return (
    <button onClick={onClick} className={`bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition ${className}`}>
      {children}
    </button>
  )
}
