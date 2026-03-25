/**
 * Header / Navigation bar for alt.it
 * - Frosted glass sticky header (bg-white/80 backdrop-blur)
 * - Logo mark: two mirrored chair icons + "alt.it" wordmark
 * - Nav links: Usage History, Saved Searches
 * - Profile avatar placeholder
 * - Theme switcher dropdown (top-right)
 */
import { useTheme } from '../context/useTheme'
import type { Theme } from '../context/ThemeCore'

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

  return (
    <div className="relative group">
      {/* Trigger button */}
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
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

      {/* Dropdown — appears on hover */}
      <div
        className="absolute right-0 top-full mt-1 w-52 rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-50"
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
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
            onClick={() => setTheme(opt.value)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-colors first:rounded-t-lg last:rounded-b-lg"
            style={{
              color: 'var(--color-text)',
              backgroundColor: theme === opt.value ? 'rgba(0,0,0,0.04)' : 'transparent',
            }}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: opt.dot }}
            />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Header() {
  return (
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

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          <button
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
            id="nav-usage-history"
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
          >
            <span className="material-symbols-outlined text-base leading-none" aria-hidden="true">
              bookmark
            </span>
            Saved Searches
          </button>
        </nav>

        {/* Right side: theme switcher + profile */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {/* Profile avatar placeholder */}
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--color-primary-light)' }}
            id="nav-profile-btn"
            aria-label="User profile"
          >
            <span
              className="material-symbols-outlined text-lg leading-none"
              style={{ color: 'var(--color-primary)' }}
              aria-hidden="true"
            >
              person
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
