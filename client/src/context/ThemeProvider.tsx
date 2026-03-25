/**
 * ThemeContext — manages the active color theme across the app.
 * Theme is persisted in localStorage so it survives page reloads.
 *
 * Supported themes:
 *   'lavender'   — Lavender & Sunflower (light only)
 *   'terracotta' — Terracotta & Sage    (light + dark)
 *   'teal'       — Deep Teal & Coral    (light + dark)
 */
import { useEffect, useState } from 'react'
import { ThemeContext, type Theme } from './ThemeCore'

const STORAGE_KEY = 'alt-it-theme'
const DEFAULT_THEME: Theme = 'lavender'

/** Applies the theme to the <html> element's data-theme attribute. */
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Rehydrate cached theme on load
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    return stored ?? DEFAULT_THEME
  })

  // Apply to DOM whenever theme changes
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function setTheme(next: Theme) {
    setThemeState(next)
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

// useTheme hook is exported from ./useTheme to satisfy react-refresh rule
