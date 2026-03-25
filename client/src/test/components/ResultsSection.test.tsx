import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ResultsSection from '../../components/ResultsSection'
import { MOCK_PRODUCTS } from '../../data/mockProducts'

describe('ResultsSection', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(<ResultsSection isVisible={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows loading spinner when becoming visible', async () => {
    render(<ResultsSection isVisible={true} />)

    expect(await screen.findByText('Finding similar products…')).toBeInTheDocument()
    expect(await screen.findByRole('status', { name: 'Loading results' })).toBeInTheDocument()
  })

  it('loads mock products after timeout', async () => {
    render(<ResultsSection isVisible={true} />)

    // Wait for the mock 1500ms timeout using real timers via RTL
    expect(await screen.findByText(`(${MOCK_PRODUCTS.length} items)`, {}, { timeout: 2000 })).toBeInTheDocument()

    expect(screen.queryByText('Finding similar products…')).not.toBeInTheDocument()
    expect(screen.getByText(/Similar Matches/)).toBeInTheDocument()

    // Should show the filter options
    expect(screen.getByText('Filter:')).toBeInTheDocument()
    expect(screen.getByText('Sort by:')).toBeInTheDocument()
  })
})
