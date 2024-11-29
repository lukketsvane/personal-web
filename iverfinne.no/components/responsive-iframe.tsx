'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResponsiveIframeProps {
  src: string
  title: string
  aspectRatio?: string
}

export function ResponsiveIframe({ src, title, aspectRatio = '1/2' }: ResponsiveIframeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeHeight, setIframeHeight] = useState('100%')

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleResize = () => {
      if (isFullscreen) {
        setIframeHeight(`${window.innerHeight}px`)
      } else {
        setIframeHeight('100%')
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [isFullscreen])

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 shadow-lg">
      <div 
        className={`relative w-full ${isFullscreen ? '' : 'overflow-hidden'}`} 
        style={{ aspectRatio: isFullscreen ? 'auto' : aspectRatio, height: isFullscreen ? iframeHeight : 'auto' }}
      >
        <iframe
          src={src}
          title={title}
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <Button
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 z-10"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
