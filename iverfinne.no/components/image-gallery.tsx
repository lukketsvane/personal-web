'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageGalleryProps {
  images: {
    src: string
    alt: string
  }[]
  className?: string
  initialIndex?: number | null
  onIndexChange?: (index: number | null) => void
}

export function ImageGallery({ images = [], className, initialIndex = null, onIndexChange }: ImageGalleryProps) {
  const [internalIndex, setInternalIndex] = useState<number | null>(null)
  
  const selectedImage = initialIndex !== null ? initialIndex : internalIndex
  const setSelectedImage = (index: number | null) => {
    if (onIndexChange) {
      onIndexChange(index)
    } else {
      setInternalIndex(index)
    }
  }

  const handlePrevious = useCallback((e?: React.MouseEvent | any) => {
    if (!images || images.length === 0) return
    e?.stopPropagation()
    setSelectedImage(selectedImage !== null ? (selectedImage - 1 + images.length) % images.length : null)
  }, [images?.length, selectedImage])

  const handleNext = useCallback((e?: React.MouseEvent | any) => {
    if (!images || images.length === 0) return
    e?.stopPropagation()
    setSelectedImage(selectedImage !== null ? (selectedImage + 1) % images.length : null)
  }, [images?.length, selectedImage])

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

  if (!images || images.length === 0) return null

  return (
    <>
      <Card className={cn("w-full max-w-[100vw] overflow-hidden border-none bg-transparent shadow-none", className)}>
        <div className="relative w-full overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 w-max py-2 px-1">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(index)
                }}
                className="h-[250px] sm:h-[350px] w-auto rounded-lg object-cover cursor-pointer transition-all hover:brightness-90"
                style={{ maxWidth: 'min(800px, 85vw)' }}
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
          className="max-w-[100vw] max-h-[100vh] p-0 bg-black/95 border-0 rounded-none w-full h-full flex items-center justify-center z-[100]"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedImage(null)
          }}
        >
          {selectedImage !== null && (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <DialogTitle className="sr-only">
                {images[selectedImage].alt || `Bilete ${selectedImage + 1} av ${images.length}`}
              </DialogTitle>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(null)
                }}
                className="absolute top-6 right-6 z-[110] p-3 text-white/50 hover:text-white transition-colors"
                aria-label="Lukk"
              >
                <X className="h-6 w-6" />
              </button>
              
              <button
                onClick={handlePrevious}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-[110] p-4 text-white/20 hover:text-white/80 transition-colors hidden sm:block"
                aria-label="Førre"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-[110] p-4 text-white/20 hover:text-white/80 transition-colors hidden sm:block"
                aria-label="Neste"
              >
                <ChevronRight className="h-8 w-8" />
              </button>

              <AnimatePresence mode='wait'>
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage].src}
                  alt={images[selectedImage].alt}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x
                    if (swipe < -50) {
                      handleNext()
                    } else if (swipe > 50) {
                      handlePrevious()
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-[95vw] max-h-[90vh] object-contain select-none touch-none"
                />
              </AnimatePresence>
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium tracking-widest uppercase">
                {selectedImage + 1} / {images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
