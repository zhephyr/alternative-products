import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

interface FavoriteItem {
  product_id: string
  product_details: {
    title: string
    price?: string
    image_url?: string
    source?: string
  }
}

interface FavoritesModalProps {
  onClose: () => void
}

export default function FavoritesModal({ onClose }: FavoritesModalProps) {
  const { token } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await fetch('http://localhost:8000/api/user/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setFavorites(data)
        }
      } catch (err) {
        console.error('Failed to load favorites', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadFavorites()
  }, [token])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" aria-modal="true" role="dialog">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-primary)' }}>bookmark</span>
            Saved Searches
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--color-background)' }}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary) transparent var(--color-primary) var(--color-primary)' }} />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
              <span className="material-symbols-outlined text-4xl mb-3 opacity-50">heart_broken</span>
              <p>You haven't saved any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <div key={fav.product_id} className="rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="aspect-[4/3] w-full bg-gray-100 flex items-center justify-center relative">
                    {fav.product_details.image_url ? (
                      <img src={fav.product_details.image_url} alt={fav.product_details.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 text-4xl">inventory_2</span>
                    )}
                    {/* Floating Source Label */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded text-[10px] font-bold tracking-wider uppercase shadow-sm">
                      {fav.product_details.source || 'Unknown Site'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-2">{fav.product_details.title}</h3>
                    <div className="font-mono text-sm tracking-tight font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {fav.product_details.price || 'Check site'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
