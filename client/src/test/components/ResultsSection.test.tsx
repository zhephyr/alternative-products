import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ResultsSection from '../../components/ResultsSection'
import { MOCK_PRODUCTS } from '../../data/mockProducts'

describe('ResultsSection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when not visible', () => {
    const { container } = render(<ResultsSection isVisible={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows loading spinner when becoming visible', async () => {
    render(<ResultsSection isVisible={true} />)

    // Advance 1ms to trigger the deferred setTimeout(..., 0)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(screen.getByText('Finding similar products…')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Loading results' })).toBeInTheDocument()
  })

  it('loads mock products after timeout', async () => {
    render(<ResultsSection isVisible={true} />)

    // Fast forward timeline past the 1500ms delay and wait for microtasks
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600)
    })

    expect(screen.queryByText('Finding similar products…')).not.toBeInTheDocument()

    // Should show results count
    expect(screen.getByText(`(${MOCK_PRODUCTS.length} items)`)).toBeInTheDocument()
    expect(screen.getByText(/Similar Matches/)).toBeInTheDocument()

    // Should show the filter options
    expect(screen.getByText('Filter:')).toBeInTheDocument()
    expect(screen.getByText('Sort by:')).toBeInTheDocument()
  })
})
