import React from 'react'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'

const components = {
  a: ({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href?.startsWith('/')) {
      return <Link href={href} {...props} />
    }
    if (href?.startsWith('#')) {
      return <a href={href} {...props} />
    }
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
  },
}

interface MarkdownRendererProps {
  content: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <MDXRemote
      source={content}
      components={components}
    />
  )
}

export default MarkdownRenderer