'use client'

import React from 'react'

interface HtmlIframeProps {
  content: string
  className?: string
  fullScreen?: boolean
}

export function HtmlIframe({ content, className, fullScreen = false }: HtmlIframeProps) {
  // Extract HTML content if it's wrapped in a markdown code block
  let htmlDoc = content
  const codeBlockRegex = /```html?\n([\s\S]*?)\n```/
  const match = content.match(codeBlockRegex)
  if (match) {
    htmlDoc = match[1]
  }

  // If it's not a full document, wrap it in a basic structure
  if (!htmlDoc.toLowerCase().includes('<html')) {
    htmlDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; overflow-x: hidden; }
          </style>
        </head>
        <body>${htmlDoc}</body>
      </html>
    `
  }

  return (
    <iframe
      srcDoc={htmlDoc}
      className={className}
      style={{
        width: '100%',
        height: fullScreen ? '100vh' : '500px',
        border: 'none',
        display: 'block'
      }}
      sandbox="allow-scripts allow-forms allow-popups allow-modals"
      title="Interactive Content"
    />
  )
}
