'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface ImageGalleryProps {
  images: {
    src: string
    alt: string
  }[]
  className?: string
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const handlePrevious = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation() // Prevent closing dialog
    setSelectedImage(prev => prev !== null ? (prev - 1 + images.length) % images.length : null)
  }, [images.length])

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation() // Prevent closing dialog
    setSelectedImage(prev => prev !== null ? (prev + 1) % images.length : null)
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return
      
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, handlePrevious, handleNext])

  return (
    <>
      <Card className={cn("w-full max-w-[100vw]", className)}>
        <div className="relative w-full overflow-x-auto">
          <div className="flex gap-4 w-max p-6 max-w-[1400px] mx-auto">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(index)
                }}
                className="h-[300px] w-auto rounded-lg object-cover cursor-pointer transition-transform hover:scale-[1.02]"
                style={{ maxWidth: 'min(800px, 90vw)' }}
              />
            ))}
          </div>
        </div>
      </Card>

      <Dialog 
        open={selectedImage !== null} 
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null)
        }}
      >
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-0"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the content
        >
          {selectedImage !== null && (
            <>
              <DialogTitle className="sr-only">
                {images[selectedImage].alt || `Image ${selectedImage + 1} of ${images.length}`}
              </DialogTitle>
              
              <div className="relative group">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(null)
                  }}
                  className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                  aria-label="Close fullscreen view"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <img
                  src={images[selectedImage].src}
                  alt={images[selectedImage].alt}
                  onClick={(e) => e.stopPropagation()}
                  className="w-auto max-h-[95vh] object-contain rounded-lg mx-auto"
                  style={{ maxWidth: '95vw' }}
                />
                
                <div className="absolute left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {selectedImage + 1} / {images.length}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

