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
import { useState } from 'react'
import Header from '../components/Header'
import UploadZone from '../components/UploadZone'
import ResultsSection from '../components/ResultsSection'
import Footer from '../components/Footer'

export default function HomePage() {
  // Track the currently uploaded image data URL
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  function handleImageUpload(dataUrl: string) {
    // Reset results for new image then show them
    setUploadedImage(dataUrl)
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

          {/* ── Results section (hidden until image uploaded) ── */}
          <ResultsSection isVisible={uploadedImage !== null} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
