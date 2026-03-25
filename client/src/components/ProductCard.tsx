/**
 * ProductCard — displays a single product in the results grid.
 * Features:
 *   - 4:5 portrait image with scale-on-hover
 *   - Brand label (uppercase, primary color)
 *   - Product name, price, star rating
 *   - Favorite button (hover reveal)
 *   - External link icon
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import type { MockProduct } from '../data/mockProducts'

interface ProductCardProps {
  product: MockProduct
  onSelect?: (product: MockProduct) => void
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="material-symbols-outlined text-sm leading-none"
          style={{
            color: star <= Math.round(rating) ? '#f59e0b' : '#e2e8f0',
            fontVariationSettings: "'FILL' 1",
          }}
          aria-hidden="true"
        >
          star
        </span>
      ))}
      <span className="text-xs ml-0.5" style={{ color: 'var(--color-text-muted)' }}>
        ({rating})
      </span>
    </div>
  )
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const { token, isAuthenticated } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      alert("Please log in to save favorites.")
      return
    }

    const newStatus = !isFavorited
    setIsFavorited(newStatus)

    try {
      if (newStatus) {
        await fetch('http://127.0.0.1:8000/api/user/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: product.id,
            product_details: {
              title: product.name,
              price: `$${product.price.toLocaleString()}`,
              image_url: product.imageUrl,
              source: product.brand
            }
          })
        })
      } else {
        await fetch(`http://127.0.0.1:8000/api/user/favorites/${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (err) {
      console.error('Failed to update favorite status', err)
      // Revert if failed
      setIsFavorited(!newStatus)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.10)' }}
      transition={{ 
        duration: 0.4, 
        ease: [0.23, 1, 0.32, 1],
        layout: { duration: 0.3 }
      }}
      className="group relative rounded-lg border flex flex-col cursor-pointer"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: '#e2e8f0',
      }}
      onClick={() => onSelect && onSelect(product)}
    >
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden rounded-t-lg relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Favorite button — hover reveal */}
        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{
            backgroundColor: isFavorited ? 'var(--color-primary)' : 'rgba(255,255,255,0.90)',
          }}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          id={`favorite-btn-${product.id}`}
        >
          <span
            className="material-symbols-outlined text-lg leading-none"
            style={{
              color: isFavorited ? 'white' : 'var(--color-primary)',
              fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0",
            }}
            aria-hidden="true"
          >
            favorite
          </span>
        </button>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        {/* Brand label */}
        <p
          className="text-xs font-bold tracking-wider uppercase"
          style={{ color: 'var(--color-primary)' }}
        >
          {product.brand}
        </p>

        {/* Product name */}
        <p
          className="text-lg font-bold leading-snug line-clamp-1"
          style={{ color: 'var(--color-text)' }}
        >
          {product.name}
        </p>

        {/* Rating */}
        <StarRating rating={product.rating} />

        {/* Price + link */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>
            ${product.price.toLocaleString()}
          </span>
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: 'var(--color-primary-light)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--color-primary-light)')
            }
            aria-label={`View ${product.name} product page`}
            id={`view-product-btn-${product.id}`}
          >
            <span
              className="material-symbols-outlined text-base leading-none transition-colors"
              style={{ color: 'var(--color-primary)' }}
              aria-hidden="true"
            >
              open_in_new
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
