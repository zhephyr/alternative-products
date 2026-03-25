import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Header from '../../components/Header'
import { ThemeProvider } from '../../context/ThemeProvider'

import * as AuthContextModule from '../../contexts/AuthContext'

const mockUseAuth = vi.fn(() => ({
  isAuthenticated: false,
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  isLoading: false
}))

vi.spyOn(AuthContextModule, 'useAuth').mockImplementation(mockUseAuth)

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

  it('renders Log In button when unauthenticated', () => {
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false
    })
    render(<ThemeProvider><Header /></ThemeProvider>)
    expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument()
  })

  it('renders Profile dropdown and navigation links when authenticated', () => {
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      user: { username: 'testuser', id: '123' },
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isLoading: false
    })
    
    render(<ThemeProvider><Header /></ThemeProvider>)
    
    expect(screen.getByText('Usage History')).toBeInTheDocument()
    expect(screen.getByText('Saved Searches')).toBeInTheDocument()
    
    const profileBtn = screen.getByLabelText(/User profile/i)
    expect(profileBtn).toBeInTheDocument()
    
    // Clicking profile should open dropdown
    fireEvent.click(profileBtn)
    
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })
})
