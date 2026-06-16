'use client';
import { useState } from 'react';
import { Bell, X } from 'lucide-react';

interface NoticeBannerProps {
  message: string;
  style: 'info' | 'warning' | 'success' | 'danger' | 'purple';
}

export function NoticeBanner({ message, style }: NoticeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  // Color mapping with inline styles for guaranteed visibility
  const colors = {
    info: { bg: '#2563eb', text: 'white', border: '#60a5fa' },
    warning: { bg: '#eab308', text: 'black', border: '#fde047' },
    success: { bg: '#059669', text: 'white', border: '#34d399' },
    danger: { bg: '#dc2626', text: 'white', border: '#f87171' },
    purple: { bg: '#7c3aed', text: 'white', border: '#a78bfa' },
  };

  const c = colors[style] || colors.purple;

  return (
    <div
      style={{
        backgroundColor: c.bg,
        color: c.text,
        borderColor: c.border,
        borderRadius: '12px',
        borderWidth: '2px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3), 0 0 20px ' + c.border + '40',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        width: '100%',
        zIndex: 10,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Bell className="w-5 h-5" />
        <p className="text-sm md:text-base font-semibold tracking-wide">
          {message}
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        style={{
          padding: '4px',
          borderRadius: '8px',
          background: 'transparent',
          border: 'none',
          color: c.text,
          opacity: 0.8,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
        aria-label="Close notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
