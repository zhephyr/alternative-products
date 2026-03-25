import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProductCard from '../../components/ProductCard'
import type { MockProduct } from '../../data/mockProducts'

const mockProduct: MockProduct = {
  id: 'test-id',
  brand: 'Acme Home',
  name: 'Modern Accent Chair',
  price: 299,
  rating: 4.5,
  imageUrl: 'https://example.com/chair.jpg',
  priceRange: '100-500',
  materials: ['wood'],
  dimensions: '1x1',
}

describe('ProductCard', () => {
  it('renders product details correctly', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Acme Home')).toBeInTheDocument()
    expect(screen.getByText('Modern Accent Chair')).toBeInTheDocument()
    // It renders price with comma formatting
    expect(screen.getByText('$299')).toBeInTheDocument()

    // It renders 5 stars (material symbols) and the rating text
    // We have 1 favorite + 1 external link + 5 rating stars = 7 total.
    // The rating stars are the first 5 in our DOM structure, but let's just check text
    expect(screen.getByText('(4.5)')).toBeInTheDocument()
  })

  it('toggles favorite state on button click', () => {
    // The favorite button only appears on hover, but we can target it in jsdom
    render(<ProductCard product={mockProduct} />)

    const favBtn = screen.getByRole('button', { name: /Add to favorites/i })
    expect(favBtn).toBeInTheDocument()

    // Click it
    fireEvent.click(favBtn)

    // Label should change
    expect(screen.getByRole('button', { name: /Remove from favorites/i })).toBeInTheDocument()
  })

  it('renders external link button', () => {
    render(<ProductCard product={mockProduct} />)

    const linkBtn = screen.getByRole('button', { name: /View Modern Accent Chair product page/i })
    expect(linkBtn).toBeInTheDocument()
  })
})
