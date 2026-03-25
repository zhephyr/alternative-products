/**
 * Mock product data for Phase 2 placeholder results.
 * Each product has fields matching future API response shape.
 */
export interface MockProduct {
  id: string
  brand: string
  name: string
  price: number
  rating: number
  reviewCount: number
  imageUrl: string
  category: string
  priceRange: 'under-100' | '100-500' | '500-1000' | 'over-1000'
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1',
    brand: 'Nordic Living',
    name: 'Velvet Accent Lounge Chair',
    price: 849,
    rating: 4.8,
    reviewCount: 124,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop',
    category: 'Seating',
    priceRange: '500-1000',
  },
  {
    id: '2',
    brand: 'Luxe Artistry',
    name: 'Sculptural Ceramic Vase',
    price: 128,
    rating: 4.6,
    reviewCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=500&fit=crop',
    category: 'Decor',
    priceRange: '100-500',
  },
  {
    id: '3',
    brand: 'Modern Light',
    name: 'Industrial Pendant Lamp',
    price: 299,
    rating: 4.5,
    reviewCount: 203,
    imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=500&fit=crop',
    category: 'Lighting',
    priceRange: '100-500',
  },
  {
    id: '4',
    brand: 'Atelier Home',
    name: 'Oak Minimal Sideboard',
    price: 1299,
    rating: 4.9,
    reviewCount: 57,
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop',
    category: 'Storage',
    priceRange: 'over-1000',
  },
  {
    id: '5',
    brand: 'Form & Function',
    name: 'Woven Rattan Floor Lamp',
    price: 189,
    rating: 4.3,
    reviewCount: 142,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=500&fit=crop',
    category: 'Lighting',
    priceRange: '100-500',
  },
  {
    id: '6',
    brand: 'Casa Serena',
    name: 'Linen Throw Pillow Set',
    price: 64,
    rating: 4.7,
    reviewCount: 318,
    imageUrl: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=400&h=500&fit=crop',
    category: 'Textiles',
    priceRange: 'under-100',
  },
  {
    id: '7',
    brand: 'Moda Studio',
    name: 'Marble Coffee Table',
    price: 749,
    rating: 4.4,
    reviewCount: 76,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=500&fit=crop',
    category: 'Tables',
    priceRange: '500-1000',
  },
  {
    id: '8',
    brand: 'Verde Botanicals',
    name: 'Handwoven Seagrass Basket',
    price: 45,
    rating: 4.6,
    reviewCount: 211,
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=500&fit=crop',
    category: 'Decor',
    priceRange: 'under-100',
  },
]
