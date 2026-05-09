/**
 * ResultsSection — displays the grid of Similar Matches.
 * - Hidden until an image is uploaded
 * - Shows a loading spinner for ~1.5s with mock data revealed after
 * - Sort By dropdown
 */
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import type { MockProduct } from '../data/mockProducts'

type SortOption = 'relevant' | 'price-asc' | 'price-desc' | 'rating-desc'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Product Rating: High to Low' },
]

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div
        className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        role="status"
        aria-label="Loading results"
      />
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
        Finding similar products…
      </p>
    </div>
  )
}

/** Filter/sort select dropdown */
function FilterSelect<T extends string>({
  id,
  value,
  onChange,
  options,
}: {
  id: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="px-3 py-2 rounded-lg border text-sm font-semibold outline-none cursor-pointer transition-colors"
      style={{
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        backgroundColor: 'var(--color-card)',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

interface ResultsSectionProps {
  isVisible: boolean
  isLoading: boolean
  products: MockProduct[]
}

export default function ResultsSection({ isVisible, isLoading, products }: ResultsSectionProps) {
  const [sort, setSort] = useState<SortOption>('relevant')
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null)

  // Apply sort
  const displayedProducts = useMemo(() => {
    let sorted = [...products]

    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => {
          const priceA = parseFloat(a.store.extracted_price.replace(/[^0-9.]/g, '')) || 0
          const priceB = parseFloat(b.store.extracted_price.replace(/[^0-9.]/g, '')) || 0
          return priceA - priceB
        })
        break
      case 'price-desc':
        sorted.sort((a, b) => {
          const priceA = parseFloat(a.store.extracted_price.replace(/[^0-9.]/g, '')) || 0
          const priceB = parseFloat(b.store.extracted_price.replace(/[^0-9.]/g, '')) || 0
          return priceB - priceA
        })
        break
      case 'rating-desc':
        sorted.sort((a, b) => b.store.rating - a.store.rating)
        break
      default:
        break // 'relevant' — keep original order
    }

    return sorted
  }, [products, sort])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          key="results-grid"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4 }}
          aria-label="Similar Matches"
          id="results-section"
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Similar Matches{' '}
              {!isLoading && (
                <span className="text-lg font-normal" style={{ color: 'var(--color-text-muted)' }}>
                  ({displayedProducts.length} items)
                </span>
              )}
            </h2>
          </div>

          {/* Sort bar */}
          {!isLoading && (
            <div
              className="flex flex-wrap items-center gap-3 pb-8 mb-8 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                Sort by:
              </span>
              <FilterSelect id="sort-by" value={sort} onChange={setSort} options={SORT_OPTIONS} />
            </div>
          )}

          {/* Loading state */}
          {isLoading && <LoadingSpinner />}

          {/* Products grid */}
          {!isLoading && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {displayedProducts.map((product, idx) => (
                <ProductCard key={product.id || idx} product={product} onSelect={setSelectedProduct} />
              ))}
            </motion.div>
          )}

          {/* Empty state */}
          {!isLoading && displayedProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                No similar products found.
              </p>
            </div>
          )}
        </motion.section>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          key="product-modal"
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </AnimatePresence>
  )
}
