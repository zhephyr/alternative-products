import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MockProduct } from '../data/mockProducts'

interface ProductModalProps {
  product: MockProduct
  onClose: () => void
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
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

  return (
    <AnimatePresence>
      <div 
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
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
            style={{ color: 'var(--color-text)' }}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>

          {/* Left: Huge Image */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100 dark:bg-gray-800">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
            <div className="flex-1">
              <p className="text-sm font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--color-primary)' }}>
                {product.brand}
              </p>
              
              <h2 id="modal-title" className="text-3xl md:text-4xl font-extrabold leading-tight mb-4" style={{ color: 'var(--color-text)' }}>
                {product.name}
              </h2>
              
              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>
                  ${product.price.toLocaleString()}
                </span>
                
                {/* Rating Badge */}
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 font-bold text-sm">
                  <span className="material-symbols-outlined text-sm leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span>{product.rating}</span>
                  <span className="opacity-70 font-normal">({product.reviewCount})</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-50" style={{ color: 'var(--color-text)' }}>Category</h3>
                  <p className="font-medium" style={{ color: 'var(--color-text)' }}>{product.category}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-50" style={{ color: 'var(--color-text)' }}>Description</h3>
                  <p className="leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    Discover the perfect addition to your space with the {product.name} from {product.brand}. 
                    Designed for both modern aesthetics and everyday durability, this piece elevates any room 
                    with its premium finish and carefully crafted details.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-4">
              <a 
                href={product.link}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg text-white transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                View at Store
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
      </div>
    </AnimatePresence>
  )
}
