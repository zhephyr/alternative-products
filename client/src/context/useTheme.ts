/**
 * useTheme — hook to access the current theme and setter.
 * Separated from ThemeContext.tsx to satisfy react-refresh rule
 * (files must only export components OR non-component exports, not both).
 */
import { useContext } from 'react'
import { ThemeContext } from './ThemeCore'

export function useTheme() {
  return useContext(ThemeContext)
}
export type { Theme } from './ThemeCore'
