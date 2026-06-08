import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
}

export function Button({ children, href, onClick, className = '' }: ButtonProps) {
  const base = `bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 active:scale-[0.98] transition-all shadow-sm hover:shadow-md ${className}`
  if (href) {
    return (
      <a href={href} className={base}>
        {children}
      </a>
    )
  }
  return (
    <button onClick={onClick} className={base}>
      {children}
    </button>
  )
}
