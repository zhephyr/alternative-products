import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HistoryModal from '../../components/HistoryModal'
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

vi.stubGlobal('fetch', vi.fn())

describe('HistoryModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders history items successfully', async () => {
    const mockHistory = [
      {
        image_url: 'http://example.com/test1.jpg',
        results: [{ title: 'Item 1' }, { title: 'Item 2' }]
      },
      {
        image_url: 'http://example.com/test2.jpg',
        results: [{ title: 'Item 3' }]
      }
    ]
    
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHistory
    })

    render(
      <ThemeProvider>
        <HistoryModal onClose={vi.fn()} />
      </ThemeProvider>
    )

    expect(screen.getByText('Usage History')).toBeInTheDocument()

    await waitFor(() => {
      // 2 Results for test1
      expect(screen.getByText('2 matches')).toBeInTheDocument()
      // 1 Result for test2
      expect(screen.getByText('1 match')).toBeInTheDocument()
    })
  })

  it('displays empty state if history is empty', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    })

    render(
      <ThemeProvider>
        <HistoryModal onClose={vi.fn()} />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/You haven't searched for any products yet/i)).toBeInTheDocument()
    })
  })
})
