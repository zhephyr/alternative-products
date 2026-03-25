import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ResultsSection from '../../components/ResultsSection'
import { MOCK_PRODUCTS } from '../../data/mockProducts'
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

describe('ResultsSection', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(<ResultsSection isVisible={false} isLoading={false} products={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows loading spinner when isLoading is true', async () => {
    render(<ResultsSection isVisible={true} isLoading={true} products={[]} />)

    expect(await screen.findByText('Finding similar products…')).toBeInTheDocument()
    expect(await screen.findByRole('status', { name: 'Loading results' })).toBeInTheDocument()
  })

  it('displays products based on props', async () => {
    render(<ResultsSection isVisible={true} isLoading={false} products={MOCK_PRODUCTS} />)

    expect(screen.queryByText('Finding similar products…')).not.toBeInTheDocument()
    expect(screen.getByText(/Similar Matches/)).toBeInTheDocument()

    // Should show results count
    expect(screen.getByText(`(${MOCK_PRODUCTS.length} items)`)).toBeInTheDocument()

    // Should show the filter options
    expect(screen.getByText('Filter:')).toBeInTheDocument()
    expect(screen.getByText('Sort by:')).toBeInTheDocument()
  })
})
