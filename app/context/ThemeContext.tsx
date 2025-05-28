'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import config, { Theme } from '@/f4.config';

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage or fallback to default config
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('f4rmhouse-theme')
      if (savedTheme) {
        try {
          return JSON.parse(savedTheme) as Theme
        } catch (error) {
          console.error('Failed to parse saved theme:', error)
        }
      }
    }
    return config.theme
  })

  // Wrapper for setTheme that also saves to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('f4rmhouse-theme', JSON.stringify(newTheme))
    }
  }

  // Apply theme whenever it changes
  useEffect(() => {
    // Apply background color to body
    document.body.className = theme.backgroundColor
    
    // Apply background image if it exists
    if (theme.backgroundImage) {
      document.documentElement.style.setProperty(
        '--background-image',
        `url(${theme.backgroundImage})`
      )
      document.body.style.backgroundImage = `url(${theme.backgroundImage})`
    } else {
      // Remove background image if not set
      document.body.style.backgroundImage = ''
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme}}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
