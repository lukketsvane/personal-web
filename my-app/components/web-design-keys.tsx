'use client'

import Spline from '@splinetool/react-spline/next'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function Component() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <main className="w-full min-h-screen bg-grid-small-black/[0.2] relative flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading 3D Scene...</p>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-5xl aspect-square">
        <Spline
          scene="https://prod.spline.design/h8pzqQm6wqekjlZU/scene.splinecode"
          onLoad={() => setIsLoading(false)}
          className="w-full h-full"
        />
      </div>
    </main>
  )
}