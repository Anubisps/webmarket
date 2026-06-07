'use client'
import { ReactNode } from 'react'

interface FancyCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FancyCard({ children, className = '', delay = 0 }: FancyCardProps) {
  return (
    <div
      className={`glass-card p-6 rounded-xl shadow-lg hover:shadow-xl transition animate-fade-in ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}
