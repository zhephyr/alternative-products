/**
 * Header / Navigation bar for alt.it
 * - Frosted glass sticky header (bg-white/80 backdrop-blur)
 * - Logo mark: two mirrored chair icons + "alt.it" wordmark
 * - Nav links: Usage History, Saved Searches
 * - Profile avatar placeholder
 * - Theme switcher dropdown (top-right)
 */
import { useState } from 'react'
import { useTheme } from '../context/useTheme'
import type { Theme } from '../context/ThemeCore'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import HistoryModal from './HistoryModal'
import FavoritesModal from './FavoritesModal'

const THEME_OPTIONS: { value: Theme; label: string; dot: string }[] = [
  { value: 'lavender', label: 'Lavender & Sunflower', dot: '#B57EDC' },
  { value: 'terracotta', label: 'Terracotta & Sage', dot: '#e37059' },
  { value: 'teal', label: 'Deep Teal & Coral', dot: '#008080' },
]

function LogoBadge() {
  return (
    <div className="flex items-center gap-2.5" aria-label="alt.it home">
      {/* Icon badge: two chair icons mirrored, filled with primary color */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center gap-0 flex-shrink-0"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <span
          className="material-symbols-outlined text-white text-[18px] leading-none"
          style={{ transform: 'scaleX(-1)', fontSize: '18px' }}
          aria-hidden="true"
        >
          chair
        </span>
        {/* Thin divider */}
        <div className="w-px h-6 bg-white/60 mx-0.5" />
        <span
          className="material-symbols-outlined text-white leading-none"
          style={{ fontSize: '18px' }}
          aria-hidden="true"
        >
          chair
        </span>
      </div>
      {/* Wordmark */}
      <span
        className="text-2xl font-extrabold tracking-tighter lowercase"
        style={{ color: 'var(--color-text)' }}
      >
        alt.it
      </span>
    </div>
  )
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-black/5"
        style={{ color: 'var(--color-text-muted)' }}
        id="theme-switcher-btn"
        aria-haspopup="listbox"
        aria-label="Switch color theme"
      >
        {/* Current theme color dot */}
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{
            backgroundColor: THEME_OPTIONS.find((t) => t.value === theme)?.dot,
          }}
        />
        <span className="hidden sm:inline">Theme</span>
        <span className="material-symbols-outlined text-base leading-none" aria-hidden="true">
          palette
        </span>
      </button>

      {/* Dropdown — appears on click */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl border z-50 flex flex-col p-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
          style={{
            backgroundColor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(12px)',
            borderColor: 'var(--color-border)',
          }}
          role="listbox"
          aria-label="Color themes"
        >
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={theme === opt.value}
              onClick={() => {
                setTheme(opt.value)
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold text-left rounded-lg transition-all hover:bg-black/5 hover:shadow-[0_3px_10px_rgba(0,0,0,0.08)] relative hover:z-10 group"
              style={{
                color: 'var(--color-text)',
                backgroundColor: theme === opt.value ? 'rgba(0,0,0,0.03)' : 'transparent',
              }}
            >
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-2 ring-transparent group-hover:ring-black/10 transition-all"
                style={{ backgroundColor: opt.dot }}
              />
              {opt.label}
              {theme === opt.value && (
                <span className="material-symbols-outlined text-sm ml-auto opacity-50">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b shadow-sm"
        style={{
          backgroundColor: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(12px)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <LogoBadge />

          {/* Right side controls */}
          <div className="flex items-center gap-6">
            {/* Nav links (Authenticated only) */}
            {isAuthenticated ? (
              <nav className="hidden md:flex items-center gap-6 mr-2" aria-label="Main navigation">
                <button
                  className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
                  style={{ color: 'var(--color-text-muted)' }}
                  id="nav-usage-history"
                  onClick={() => setShowHistoryModal(true)}
                >
                  <span className="material-symbols-outlined text-base leading-none" aria-hidden="true">
                    history
                  </span>
                  Usage History
                </button>
                <button
                  className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
                  style={{ color: 'var(--color-text-muted)' }}
                  id="nav-saved-searches"
                  onClick={() => setShowFavoritesModal(true)}
                >
                  <span className="material-symbols-outlined text-base leading-none" aria-hidden="true">
                    bookmark
                  </span>
                  Saved Searches
                </button>
              </nav>
            ) : null}

            {/* Theme & Profile / Auth Button */}
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              
              {/* Profile or Login */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition-colors hover:bg-black/5"
                    style={{ backgroundColor: 'var(--color-primary-light)' }}
                    id="nav-profile-btn"
                    aria-label="User profile"
                    aria-haspopup="menu"
                  >
                    <span
                      className="material-symbols-outlined text-lg leading-none"
                      style={{ color: 'var(--color-primary)' }}
                      aria-hidden="true"
                    >
                      person
                    </span>
                  </button>

                  {showProfileDropdown && (
                    <div
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl border z-50 flex flex-col p-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.98)',
                        backdropFilter: 'blur(12px)',
                        borderColor: 'var(--color-border)',
                      }}
                      role="menu"
                    >
                      <div 
                        className="px-4 py-3 mb-1 border-b"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-0.5" style={{ color: 'var(--color-text)' }}>
                          Account
                        </p>
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>
                          {user?.username}
                        </p>
                      </div>
                      <button
                        role="menuitem"
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold text-left rounded-lg transition-all hover:bg-black/5 hover:shadow-[0_3px_10px_rgba(0,0,0,0.08)] relative hover:z-10"
                        style={{ color: 'var(--color-error, #ef4444)' }}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to log out?')) {
                            logout()
                            setShowProfileDropdown(false)
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-base leading-none">
                          logout
                        </span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  onClick={() => setShowAuthModal(true)}
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Conditionally render Modals */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      {showHistoryModal && (
        <HistoryModal onClose={() => setShowHistoryModal(false)} />
      )}
      {showFavoritesModal && (
        <FavoritesModal onClose={() => setShowFavoritesModal(false)} />
      )}
    </>
  )
}
