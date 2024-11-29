'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function WebDesignKeys() {
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const handleClick = () => {
    setIsDark(!isDark)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className="w-full h-full relative" onClick={handleClick}>
     
     <iframe src='https://my.spline.design/floatingcards-ed186cc3661bffb7e71bf6ac40e56185/' frameBorder='0' width='100%' height='100%'></iframe>
    </div>
  )
}

export default WebDesignKeys

