import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FavoritesModal from '../../components/FavoritesModal'
import { ThemeProvider } from '../../context/ThemeProvider'
import * as AuthContextModule from '../../contexts/AuthContext'

const mockUseAuth = vi.fn(() => ({
  isAuthenticated: true,
  user: { username: 'testuser', id: '123' },
  token: 'mock-token',
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  isLoading: false
}))

vi.spyOn(AuthContextModule, 'useAuth').mockImplementation(mockUseAuth)

// Mock fetch
vi.stubGlobal('fetch', vi.fn())

describe('FavoritesModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a loading state initially and then displays favorite products', async () => {
    const mockFavorites = [
      { product_id: '123', product_details: { title: 'Lounge Chair', price: '$200', source: 'IKEA' } },
      { product_id: '456', product_details: { title: 'Modern Lamp', price: '$50', source: 'Target' } }
    ]
    
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFavorites
    })

    const onClose = vi.fn()
    render(
      <ThemeProvider>
        <FavoritesModal onClose={onClose} />
      </ThemeProvider>
    )

    // Displays title
    expect(screen.getByText('Saved Searches')).toBeInTheDocument()

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText('Lounge Chair')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Modern Lamp')).toBeInTheDocument()
    expect(screen.getByText('$200')).toBeInTheDocument()
  })

  it('displays empty state if no favorites exist', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(
      <ThemeProvider>
        <FavoritesModal onClose={vi.fn()} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/You haven't saved any products yet/i)).toBeInTheDocument()
    })
  })
})
