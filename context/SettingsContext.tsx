'use client'
import { createContext, useContext, useEffect, useState } from 'react'

interface SettingsContextType {
  settings: Record<string, any>
  loading: boolean
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  loading: true,
  refreshSettings: async () => {}
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
