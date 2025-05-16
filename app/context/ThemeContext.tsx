'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import config, { Theme } from '@/f4.config';

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(config.theme)

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
