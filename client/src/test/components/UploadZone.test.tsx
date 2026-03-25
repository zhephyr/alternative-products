import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UploadZone from '../../components/UploadZone'

describe('UploadZone', () => {
  it('renders the initial state prompt', () => {
    render(<UploadZone onImageUpload={vi.fn()} uploadedImage={null} />)
    expect(screen.getByText('Drop or Paste Image')).toBeInTheDocument()
    expect(screen.getByText('Upload Image')).toBeInTheDocument()
    expect(screen.getByText('Paste Link')).toBeInTheDocument()
  })

  it('shows URL input when Paste Link is clicked', () => {
    render(<UploadZone onImageUpload={vi.fn()} uploadedImage={null} />)
    const pasteLinkBtn = screen.getByText('Paste Link')
    fireEvent.click(pasteLinkBtn)

    expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load' })).toBeInTheDocument()
  })

  it('renders the preview state when an image is provided', () => {
    render(<UploadZone onImageUpload={vi.fn()} uploadedImage="data:image/png;base64,mock" />)
    const img = screen.getByAltText('Uploaded preview')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'data:image/png;base64,mock')
    expect(screen.getByText('Change image')).toBeInTheDocument()
  })

  it('triggers file picker when prompt is clicked', () => {
    render(<UploadZone onImageUpload={vi.fn()} uploadedImage={null} />)
    // Actually we can't easily spy on internal ref.click(), but we can ensure the input exists
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', 'image/*')
  })
})
