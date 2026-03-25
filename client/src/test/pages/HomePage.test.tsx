import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import HomePage from '../../pages/HomePage'
import { ThemeProvider } from '../../context/ThemeProvider'

describe('HomePage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders initial state with hero and hidden results', () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>,
    )

    // Check Header
    expect(screen.getAllByText('alt.it')[0]).toBeInTheDocument()
    // Check Hero
    expect(screen.getByText(/Find your aesthetic/i)).toBeInTheDocument()
    // Check UploadZone
    expect(screen.getByText('Drop or Paste Image')).toBeInTheDocument()
    // Check empty Results
    expect(screen.queryByText(/Similar Matches/)).not.toBeInTheDocument()
    // Check Footer
    expect(screen.getByText('© 2026 alt.it')).toBeInTheDocument()
  })

  // We can't fully mock the file upload event easily here without mocking
  // child components, but we can test the structure is intact.
})
