import { useCallback } from 'react'

export function useAnalytics() {
  const track = useCallback(async (eventType: string, element?: string, extra?: any) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, element, extra })
      })
    } catch (e) {
      // silently fail
    }
  }, [])

  return { track }
}
