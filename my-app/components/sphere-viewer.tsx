'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'

export default function Component() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <div className="relative w-full aspect-square bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          src="https://sphere.v0.build/"
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="3D Sphere Material Painter"
        />
      </div>
    </Card>
  )
}