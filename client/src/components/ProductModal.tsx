import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MockProduct } from '../data/mockProducts'

interface ProductModalProps {
  product: MockProduct
  onClose: () => void
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0)

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const nextImage = () => setCurrentIdx((prev) => (prev + 1) % product.thumbnails.length)
  const prevImage = () => setCurrentIdx((prev) => (prev - 1 + product.thumbnails.length) % product.thumbnails.length)

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-md transition-colors"
            style={{ color: 'var(--color-text)' }}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>

          {/* Left: Huge Image Carousel */}
          <div className="w-full md:w-3/5 h-80 md:h-auto relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIdx}
                src={product.thumbnails[currentIdx]}
                alt={`${product.title} - ${currentIdx + 1}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-contain"
              />
            </AnimatePresence>

            {product.thumbnails.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center shadow-lg transition-all"
                  aria-label="Previous image"
                >
                  <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center shadow-lg transition-all"
                  aria-label="Next image"
                >
                  <span className="material-symbols-outlined text-2xl">chevron_right</span>
                </button>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.thumbnails.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx(i)}
                      className="w-2.5 h-2.5 rounded-full transition-all"
                      style={{
                        backgroundColor: i === currentIdx ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                        transform: i === currentIdx ? 'scale(1.3)' : 'scale(1)'
                      }}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col overflow-y-auto">
            <div className="flex-1">
              <p className="text-sm font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--color-primary)' }}>
                {product.brand}
              </p>

              <h2 id="modal-title" className="text-3xl md:text-4xl font-extrabold leading-tight mb-4" style={{ color: 'var(--color-text)' }}>
                {product.title}
              </h2>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>
                  {product.store.extracted_price}
                </span>

                {/* Rating Badge */}
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 font-bold text-sm">
                  <span className="material-symbols-outlined text-sm leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span>{product.store.rating}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-50" style={{ color: 'var(--color-text)' }}>Description</h3>
                  <p className="leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-muted)' }}>
                    {(function() {
                      if (typeof product.about_the_product === 'string') return product.about_the_product;
                      if (Array.isArray(product.about_the_product)) {
                        return product.about_the_product.map(item => 
                          typeof item === 'string' ? item : JSON.stringify(item)
                        ).join('\n\n');
                      }
                      if (typeof product.about_the_product === 'object' && product.about_the_product !== null) {
                        return JSON.stringify(product.about_the_product, null, 2);
                      }
                      return null;
                    })() || 
                    `Discover the perfect addition to your space with the ${product.title} from ${product.brand}. Designed for both modern aesthetics and everyday durability, this piece elevates any room with its premium finish and carefully crafted details.`}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-50" style={{ color: 'var(--color-text)' }}>Store</h3>
                  <p className="font-medium" style={{ color: 'var(--color-text)' }}>{product.store.name}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-4">
              <a
                href={product.store.link}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg text-white transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                View at {product.store.name}
                <span className="material-symbols-outlined text-xl">open_in_new</span>
              </a>

              <button
                className="w-16 rounded-xl flex items-center justify-center transition-colors border-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                aria-label="Add to favorites"
              >
                <span className="material-symbols-outlined text-2xl">favorite</span>
              </button>
            </div>
          </div>
        </motion.div>
    </motion.div>
  )
}
