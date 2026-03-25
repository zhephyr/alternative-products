/**
 * UploadZone — handles image upload via:
 *   1. File picker (click)
 *   2. Drag and drop
 *   3. Clipboard paste (Ctrl+V)
 *   4. URL input
 *
 * When an image is accepted, calls onImageUpload with the data URL.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadZoneProps {
  /** Called when an image is successfully loaded */
  onImageUpload: (dataUrl: string) => void
  /** Currently displayed image (if any) */
  uploadedImage: string | null
}

export default function UploadZone({ onImageUpload, uploadedImage }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [urlError, setUrlError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /** Read a File as a data URL and pass it up */
  const readFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') onImageUpload(result)
      }
      reader.readAsDataURL(file)
    },
    [onImageUpload],
  )

  /** Handle drag-over highlight */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) readFile(file)
    },
    [readFile],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) readFile(file)
  }

  /** Load image from URL */
  async function handleUrlSubmit() {
    setUrlError('')
    if (!urlValue.trim()) return
    try {
      const response = await fetch(urlValue)
      if (!response.ok) throw new Error('Could not fetch image')
      const blob = await response.blob()
      if (!blob.type.startsWith('image/')) throw new Error('URL does not point to an image')
      readFile(new File([blob], 'image', { type: blob.type }))
      setShowUrlInput(false)
      setUrlValue('')
    } catch {
      setUrlError('Could not load image from that URL.')
    }
  }

  /** Listen for clipboard paste anywhere on the page */
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) readFile(file)
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [readFile])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        className="relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer group"
        style={{
          borderColor: isDragging
            ? 'var(--color-primary)'
            : 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
          backgroundColor: 'rgba(255,255,255,0.60)',
          backdropFilter: 'blur(4px)',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploadedImage && fileInputRef.current?.click()}
        animate={{ scale: isDragging ? 1.01 : 1 }}
        transition={{ duration: 0.15 }}
        id="upload-zone"
        role="button"
        tabIndex={0}
        aria-label="Upload image zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
          id="file-input"
        />

        <AnimatePresence mode="wait">
          {uploadedImage ? (
            /* ── Uploaded image preview ── */
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative py-6 px-8 flex flex-col items-center gap-4"
            >
              <img
                src={uploadedImage}
                alt="Uploaded preview"
                className="max-h-72 max-w-full rounded-xl object-contain shadow-md"
              />
              <button
                className="text-sm font-semibold py-2 px-6 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  color: 'var(--color-primary)',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                id="change-image-btn"
              >
                Change image
              </button>
            </motion.div>
          ) : (
            /* ── Empty upload prompt ── */
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 px-10 flex flex-col items-center gap-5 text-center"
            >
              {/* Icon pill */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                }}
              >
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  add_photo_alternate
                </span>
              </div>

              <div>
                <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  Drop or Paste Image
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Upload an image of an interior space or furniture to find similar products
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                <button
                  className="px-8 py-3 rounded-lg font-bold text-white transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  id="upload-image-btn"
                >
                  Upload Image
                </button>
                <button
                  className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                    color: 'var(--color-primary)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowUrlInput((v) => !v)
                  }}
                  id="paste-link-btn"
                >
                  Paste Link
                </button>
              </div>

              {/* URL input (shown when Paste Link is clicked) */}
              <AnimatePresence>
                {showUrlInput && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="w-full max-w-md flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="url"
                      value={urlValue}
                      onChange={(e) => setUrlValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2.5 rounded-lg border text-sm outline-none"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                        backgroundColor: 'white',
                      }}
                      id="url-input"
                      autoFocus
                    />
                    <button
                      onClick={handleUrlSubmit}
                      className="px-4 py-2.5 rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      id="url-submit-btn"
                    >
                      Load
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {urlError && <p className="text-sm text-red-500 mt-1">{urlError}</p>}

              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                or press{' '}
                <kbd
                  className="px-1.5 py-0.5 rounded text-xs border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  Ctrl+V
                </kbd>{' '}
                to paste from clipboard
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag overlay highlight */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
              }}
            >
              <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                Drop your image here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
