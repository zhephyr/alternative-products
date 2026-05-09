/**
 * Mock product data for Phase 2 placeholder results.
 * Each product has fields matching future API response shape.
 */
export interface MockProduct {
  id: string
  brand: string
  title: string
  thumbnails: string[]
  store: {
    name: string
    extracted_price: string
    rating: number
    logo: string
    link: string
  }
  about_the_product?: string
  // Meta fields for filtering/compat
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1',
    brand: 'Nordic Living',
    title: 'Velvet Accent Lounge Chair',
    thumbnails: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop'],
    store: {
      name: 'Nordic Living',
      extracted_price: '$849',
      link: '#',
      rating: 4.8,
      logo: '#'
    },
  },
  {
    id: '2',
    brand: 'Luxe Artistry',
    title: 'Sculptural Ceramic Vase',
    thumbnails: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=500&fit=crop'],
    store: {
      name: 'Luxe Artistry',
      extracted_price: '$128',
      link: '#',
      rating: 4.6,
      logo: '#'
    },
  },
  {
    id: '3',
    brand: 'Modern Light',
    title: 'Industrial Pendant Lamp',
    thumbnails: ['https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=500&fit=crop'],
    store: {
      name: 'Modern Light',
      extracted_price: '$299',
      link: '#',
      rating: 4.5,
      logo: '#'
    },
  },
]
