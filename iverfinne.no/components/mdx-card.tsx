'use client'

import { useState, useMemo } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { MDXRemote } from 'next-mdx-remote'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import { Link2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { ImageGallery } from "@/components/image-gallery"
import { ResponsiveIframe } from "@/components/responsive-iframe"

const WebDesignKeys = dynamic(() => import('@/components/WebDesignKeys'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading 3D Scene...</div>
})

const mdxComponents = {
  h1: (props: any) => <h1 {...props} className="text-2xl font-bold mt-4 mb-2 break-words" />,
  h2: (props: any) => <h2 {...props} className="text-xl font-semibold mt-3 mb-2 break-words" />,
  h3: (props: any) => <h3 {...props} className="text-lg font-medium mt-2 mb-1 break-words" />,
  h4: (props: any) => <h4 {...props} className="text-base font-medium mt-2 mb-1 break-words" />,
  h5: (props: any) => <h5 {...props} className="text-sm font-medium mt-2 mb-1 break-words" />,
  h6: (props: any) => <h6 {...props} className="text-xs font-medium mt-2 mb-1 break-words" />,
  p: (props: any) => <p {...props} className="break-words" />,
  pre: (props: any) => <pre {...props} className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words" />,
  code: (props: any) => <code {...props} className="bg-gray-800 text-gray-100 rounded px-1.5 py-0.5 whitespace-pre-wrap break-words" />,
  ImageGallery: ImageGallery,
  iframe: (props: any) => (
    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden mb-4">
      <iframe {...props} className="absolute inset-0 w-full h-full border-0" />
    </div>
  ),
  ResponsiveIframe: ResponsiveIframe,
}

interface Post {
  title: string
  description: string
  date: string
  tags: string[] | string | undefined
  slug: string
  type: "writing" | "books" | "projects" | "outgoing_links"
  image?: string
  coverimage?: string
  content: string
  url?: string
  icon?: string
  thumbnails?: { src: string; alt: string }[]
}

interface MDXCardProps {
  post: Post
  isExpanded: boolean
  onToggle: () => void
  serializedContent: MDXRemoteSerializeResult | null
}

const TimelineConnector = () => (
  <div className="absolute left-0 sm:left-0 w-0.5 top-0 bottom-0 bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />
)

const TimelineNode = ({ type }: { type: string }) => {
  const typeColors = {
    writing: "bg-blue-500",
    books: "bg-green-500",
    projects: "bg-purple-500",
    outgoing_links: "bg-orange-500"
  }
  
  return (
    <div className={cn(
      "absolute left-0 sm:left-0 top-[1.125rem] w-3 h-3 sm:w-4 sm:h-4 rounded-full -translate-x-1/2 border-2 border-white dark:border-gray-900 z-10",
      typeColors[type as keyof typeof typeColors] || "bg-gray-500"
    )} />
  )
}

export function MDXCard({ post, isExpanded, onToggle, serializedContent }: MDXCardProps) {
  const [showAllTags, setShowAllTags] = useState(false)

  const tagColors = useMemo(() => {
    if (!Array.isArray(post.tags)) return {}
    return post.tags.reduce((acc, tag) => {
      switch (tag) {
        case "sign language":
        case "machine learning":
        case "computer vision":
          return { ...acc, [tag]: "bg-blue-500 hover:bg-blue-600" }
        case "accessibility":
        case "gesture recognition":
          return { ...acc, [tag]: "bg-green-500 hover:bg-green-600" }
        case "advent-of-code":
          return { ...acc, [tag]: "bg-red-500 hover:bg-red-600" }
        case "philosophy":
        case "visualization":
        case "d3js":
        case "wittgenstein":
        case "react":
          return { ...acc, [tag]: "bg-purple-500 hover:bg-purple-600" }
        case "3D":
        case "design":
        case "interactive":
        case "spline":
          return { ...acc, [tag]: "bg-yellow-500 hover:bg-yellow-600" }
        default:
          return { ...acc, [tag]: "bg-gray-500 hover:bg-gray-600" }
      }
    }, {} as Record<string, string>)
  }, [post.tags])

  const handleClick = () => {
    if (post.type === "outgoing_links" && post.url) {
      window.open(post.url, '_blank')
    } else {
      onToggle()
    }
  }

  const handleUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (post.url) {
      window.open(post.url, '_blank')
    }
  }

  const handleShowAllTags = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowAllTags(true)
  }

  const renderTags = () => {
    if (!Array.isArray(post.tags)) return null

    const tagsToShow = showAllTags ? post.tags : post.tags.slice(0, 5)
    const remainingTags = post.tags.length - tagsToShow.length

    return (
      <div className="flex gap-1.5 flex-wrap">
        {tagsToShow.map((tag) => (
          <Badge 
            key={`${post.slug}-tag-${tag}`}
            variant="secondary"
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium transition-colors text-white",
              tagColors[tag]
            )}
          >
            {tag}
          </Badge>
        ))}
        {!showAllTags && remainingTags > 0 && (
          <Badge 
            variant="secondary"
            className="text-xs px-2 py-0.5 rounded-full font-medium transition-colors bg-gray-500 hover:bg-gray-600 text-white cursor-pointer"
            onClick={handleShowAllTags}
          >
            ...
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="relative grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 max-w-full pl-4 sm:pl-0">
      <div className="hidden sm:block text-right pt-5 pr-6 w-24 shrink-0">
        <time className="text-lg font-semibold text-muted-foreground">
          {new Date(post.date).toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit' 
          })}
        </time>
      </div>
      <div className="relative min-w-0">
        <div className="block">
          <TimelineNode type={post.type} />
          <TimelineConnector />
        </div>
        <div className="pb-8 pt-0">
          <motion.article 
            className={cn(
              "relative rounded-lg p-4 cursor-pointer transition-all",
              isExpanded ? "bg-blue-50 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800",
              post.type === "outgoing_links" && "hover:cursor-alias",
              "ml-0"
            )}
            onClick={handleClick}
            initial={false}
            animate={{ backgroundColor: isExpanded ? "#f0f9ff" : "transparent" }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            {/* Title Section */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight mb-2">{post.title}</h2>
                  {post.url && (
                    <button 
                      onClick={handleUrlClick}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Open link in new tab"
                    >
                      <Link2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <time className="block sm:hidden text-sm text-muted-foreground mb-2">
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit' 
                  })}
                </time>
                <p className="text-muted-foreground text-sm">{post.description}</p>
              </div>
              {post.type === "books" && post.icon && (
                <div className="relative w-16 h-16 shrink-0">
                  <Image
                    src={post.icon}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover rounded-sm"
                    sizes="64px"
                  />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {!isExpanded && post.thumbnails && post.thumbnails.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {post.thumbnails.slice(0, 3).map((img, i) => (
                  <div 
                    key={`${post.slug}-thumb-${i}`}
                    className="aspect-square relative bg-gray-100 rounded-md overflow-hidden"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {renderTags()}

            {/* Expanded Content */}
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="prose dark:prose-invert max-w-none text-sm overflow-hidden break-words">
                    {serializedContent && (
                      <MDXRemote
                        {...serializedContent}
                        components={{
                          ...mdxComponents,
                          ImageGallery,
                          WebDesignKeys
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        </div>
      </div>
    </div>
  )
}

