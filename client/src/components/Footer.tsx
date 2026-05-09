/**
 * Footer for alt.it — three-column layout (logo / nav links / social)
 * Semi-transparent white layered over the dot grid.
 */
export default function Footer() {
  return (
    <footer
      className="mt-24 border-t py-12"
      style={{
        backgroundColor: 'rgba(255,255,255,0.50)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <span
              className="material-symbols-outlined text-white leading-none"
              style={{ fontSize: '16px' }}
              aria-hidden="true"
            >
              chair
            </span>
          </div>
          <span
            className="text-lg font-extrabold tracking-tighter lowercase"
            style={{ color: 'var(--color-text)' }}
          >
            alt.it
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap justify-center gap-6" aria-label="Footer navigation">
          {['About Us', 'API Documentation', 'Terms of Service', 'Contact Support'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Social placeholder */}
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          © 2026 alt.it
        </p>
      </div>
    </footer>
  )
}
