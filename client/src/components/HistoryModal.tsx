import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

interface HistoryItem {
  image_url: string
  results: any[]
}

interface HistoryModalProps {
  onClose: () => void
}

export default function HistoryModal({ onClose }: HistoryModalProps) {
  const { token } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('http://localhost:8000/api/user/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setHistory(data)
        }
      } catch (err) {
        console.error('Failed to load history', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadHistory()
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
            <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-primary)' }}>history</span>
            Usage History
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
          ) : history.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
              <span className="material-symbols-outlined text-4xl mb-3 opacity-50">search_off</span>
              <p>You haven't searched for any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {history.map((item, idx) => (
                <div key={idx} className="rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="aspect-square w-full bg-gray-100 flex items-center justify-center relative">
                    <img 
                      src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:8000/uploads/${item.image_url}`} 
                      alt="Past search" 
                      className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: item.image_url ? 0 : 1 }}>
                      <span className="material-symbols-outlined text-gray-400 text-4xl">image_not_supported</span>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="font-semibold text-sm">
                      {new Date().toLocaleDateString()} {/* Mock date for now */}
                    </div>
                    <div className="text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                      {item.results ? item.results.length : 0} match{item.results?.length !== 1 ? 'es' : ''}
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
