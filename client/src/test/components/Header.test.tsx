import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Header from '../../components/Header'
import { ThemeProvider } from '../../context/ThemeProvider'

// Mock the CSS module if needed, though we use standard CSS
describe('Header', () => {
  it('renders alt.it logo and title', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    )
    expect(screen.getByText('alt.it')).toBeInTheDocument()
    expect(screen.getAllByText('chair')[0]).toBeInTheDocument()
  })

  it('contains the Theme Switcher dropdown', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    )
    // The dropdown should be present
    const select = screen.getByRole('button', { name: /Switch color theme/i })
    expect(select).toBeInTheDocument()
  })

  it('toggles theme selector on click', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    )

    const button = screen.getByRole('button', { name: /Switch color theme/i })
    fireEvent.click(button)

    // Should open dropdown
    expect(screen.getByText('Lavender & Sunflower')).toBeInTheDocument()
    expect(screen.getByText('Terracotta & Sage')).toBeInTheDocument()
    expect(screen.getByText('Deep Teal & Coral')).toBeInTheDocument()
  })
})
