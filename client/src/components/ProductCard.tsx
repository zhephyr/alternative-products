/**
 * ProductCard — displays a single product in the results grid.
 * Features:
 *   - 4:5 portrait image carousel with smooth transitions
 *   - Brand label (uppercase, primary color)
 *   - Product title, price, star rating
 *   - Favorite button (hover reveal)
 *   - External link icon
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [currentIdx, setCurrentIdx] = useState(0)

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
              title: product.title,
              price: product.store.extracted_price,
              image_url: product.thumbnails[0] || '',
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
      setIsFavorited(!newStatus)
    }
  }

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIdx((prev) => (prev + 1) % product.thumbnails.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIdx((prev) => (prev - 1 + product.thumbnails.length) % product.thumbnails.length)
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
      className="group relative rounded-lg border flex flex-col cursor-pointer overflow-hidden"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: '#e2e8f0',
      }}
      onClick={() => onSelect && onSelect(product)}
    >
      {/* Carousel Container */}
      <div className="aspect-[4/5] overflow-hidden relative bg-gray-100">
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={currentIdx}
            src={product.thumbnails[currentIdx]}
            alt={`${product.title} - image ${currentIdx + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Carousel Controls (visible on hover) */}
        {product.thumbnails.length > 1 && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md pointer-events-auto hover:bg-white"
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-md pointer-events-auto hover:bg-white"
              aria-label="Next image"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {product.thumbnails.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === currentIdx ? 'var(--color-primary)' : 'rgba(255,255,255,0.6)',
                    transform: i === currentIdx ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Favorite button — hover reveal */}
        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
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
        <p className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--color-primary)' }}>
          {product.brand}
        </p>

        <p className="text-lg font-bold leading-snug line-clamp-1" style={{ color: 'var(--color-text)' }}>
          {product.title}
        </p>

        <StarRating rating={product.store.rating} />

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>
            {product.store.extracted_price}
          </span>
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: 'var(--color-primary-light)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-light)')}
            aria-label={`View ${product.title} at ${product.store.name}`}
            id={`view-product-btn-${product.id}`}
          >
            <span className="material-symbols-outlined text-base leading-none" style={{ color: 'var(--color-primary)' }}>
              open_in_new
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
