/**
 * ResultsSection — displays the grid of Similar Matches.
 * - Hidden until an image is uploaded
 * - Shows a loading spinner for ~1.5s with mock data revealed after
 * - Filter bar (Price Range, Product Rating) + Sort By dropdown
 */
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'
import { MOCK_PRODUCTS, type MockProduct } from '../data/mockProducts'

type SortOption = 'relevant' | 'price-asc' | 'price-desc' | 'rating-desc'
type PriceFilter = 'all' | 'under-100' | '100-500' | '500-1000' | 'over-1000'
type RatingFilter = 'all' | '4.5+' | '4+' | '3+'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Product Rating: High to Low' },
]

const PRICE_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-100', label: 'Under $100' },
  { value: '100-500', label: '$100 – $500' },
  { value: '500-1000', label: '$500 – $1,000' },
  { value: 'over-1000', label: 'Over $1,000' },
]

const RATING_OPTIONS: { value: RatingFilter; label: string }[] = [
  { value: 'all', label: 'All Ratings' },
  { value: '4.5+', label: '4.5+ Stars' },
  { value: '4+', label: '4+ Stars' },
  { value: '3+', label: '3+ Stars' },
]

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      {/* Animated spinner ring using primary color */}
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
}

export default function ResultsSection({ isVisible }: ResultsSectionProps) {
  const [searchKey, setSearchKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<MockProduct[]>([])
  const [sort, setSort] = useState<SortOption>('relevant')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')

  // Increment searchKey whenever the section becomes visible (new image uploaded)
  useEffect(() => {
    if (!isVisible) return
    const id = setTimeout(() => {
      setSearchKey((k) => k + 1)
    }, 0)
    return () => clearTimeout(id)
  }, [isVisible])

  // Run mock loading whenever searchKey increments (avoids synchronous setState in effect)
  useEffect(() => {
    if (searchKey === 0) return
    let isActive = true

    const startTimer = setTimeout(() => {
      if (isActive) {
        setIsLoading(true)
        setProducts([])
      }
    }, 0)

    const finishTimer = setTimeout(() => {
      if (isActive) {
        setProducts(MOCK_PRODUCTS)
        setIsLoading(false)
      }
    }, 1500)

    return () => {
      isActive = false
      clearTimeout(startTimer)
      clearTimeout(finishTimer)
    }
  }, [searchKey])

  // Apply filters and sort
  const displayedProducts = useMemo(() => {
    let filtered = [...products]

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter((p) => p.priceRange === priceFilter)
    }

    // Rating filter
    const ratingMin =
      ratingFilter === '4.5+' ? 4.5 : ratingFilter === '4+' ? 4 : ratingFilter === '3+' ? 3 : 0
    filtered = filtered.filter((p) => p.rating >= ratingMin)

    // Sort
    switch (sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        break // 'relevant' — keep original order
    }

    return filtered
  }, [products, sort, priceFilter, ratingFilter])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
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

          {/* Filter + Sort bar */}
          {!isLoading && (
            <div
              className="flex flex-wrap items-center gap-3 pb-8 mb-8 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                Filter:
              </span>
              <FilterSelect
                id="price-filter"
                value={priceFilter}
                onChange={setPriceFilter}
                options={PRICE_OPTIONS}
              />
              <FilterSelect
                id="rating-filter"
                value={ratingFilter}
                onChange={setRatingFilter}
                options={RATING_OPTIONS}
              />

              {/* Divider */}
              <div
                className="w-px h-6 mx-2 hidden sm:block"
                style={{ backgroundColor: 'var(--color-border)' }}
              />

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Empty state after filters */}
          {!isLoading && displayedProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                No products match your filters.
              </p>
              <button
                className="mt-4 text-sm font-bold underline"
                style={{ color: 'var(--color-primary)' }}
                onClick={() => {
                  setPriceFilter('all')
                  setRatingFilter('all')
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  )
}
