/**
 * HomePage — the main Visual Product Search page.
 *
 * Layout:
 *   1. Hero section — headline + upload zone
 *   2. Results section — hidden until image uploaded
 *   3. Footer
 *
 * Implements all Phase 2 requirements:
 *   - Upload zone (file, drag/drop, paste, URL)
 *   - Loading state + mock results
 *   - Theme-switching dropdown (in Header)
 *   - Price Range + Product Rating filters
 *   - Sort By dropdown
 */
import { useState, useRef } from 'react'
import Header from '../components/Header'
import UploadZone from '../components/UploadZone'
import ResultsSection from '../components/ResultsSection'
import Footer from '../components/Footer'
import type { MockProduct } from '../data/mockProducts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function HomePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [streamedProducts, setStreamedProducts] = useState<MockProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  async function handleImageUpload(dataUrl: string, file: File) {
    // Reset state for new search
    setUploadedImage(dataUrl)
    setStreamedProducts([])
    setIsSearching(true)
    
    // Close existing stream if any
    if (eventSourceRef.current) {
        eventSourceRef.current.close()
    }

    try {
      // 1. POST image to backend
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) throw new Error("Failed to upload image")
      
      const { session_id } = await res.json()
      
      // 2. Connect to SSE stream
      const sse = new EventSource(`${API_URL}/api/stream/${session_id}`)
      eventSourceRef.current = sse
      
      sse.addEventListener('new_product', (e) => {
        const newProduct = JSON.parse(e.data)
        setStreamedProducts(prev => [...prev, newProduct])
      })
      
      sse.addEventListener('complete', () => {
        setIsSearching(false)
        sse.close()
      })
      
      sse.addEventListener('error', () => {
        setIsSearching(false)
        sse.close()
      })
      
    } catch (err) {
      console.error(err)
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ color: 'var(--color-text)' }}>
      {/* Sticky frosted glass header */}
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6">
          {/* ── Hero section ── */}
          <section className="pt-16 pb-8 mb-8" aria-label="Search hero">
            {/* Headline */}
            <div className="max-w-2xl mb-12">
              <h1
                className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Find your aesthetic{' '}
                <span className="relative inline-block" style={{ color: 'var(--color-primary)' }}>
                  instantly.
                  {/* Decorative accent underline */}
                  <span
                    className="absolute left-0 -bottom-2 w-full h-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                    aria-hidden="true"
                  />
                </span>
              </h1>
              <p
                className="text-lg mt-6 leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Upload an image of an interior space or a piece of furniture to find similar
                high-quality products from our curated database.
              </p>
            </div>

            {/* Upload zone */}
            <UploadZone onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
          </section>

          {/* ── Results section (receives streaming data) ── */}
          <ResultsSection 
            isVisible={uploadedImage !== null} 
            isLoading={isSearching}
            products={streamedProducts}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
