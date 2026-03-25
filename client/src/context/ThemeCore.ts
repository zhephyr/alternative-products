import { createContext } from 'react'

export type Theme = 'lavender' | 'terracotta' | 'teal'

export interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'lavender',
  setTheme: () => {},
})
