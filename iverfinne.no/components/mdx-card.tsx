'use client'

import { useState, useMemo } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { MDXRemote } from 'next-mdx-remote'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
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
  pre: (props: any) => <pre {...props} className="whitespace-pre-wrap break-words" />,
  code: (props: any) => <code {...props} className="whitespace-pre-wrap break-words" />,
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
  const tagColors = useMemo(() => {
    if (!Array.isArray(post.tags)) return {}
    return post.tags.reduce((acc, tag) => {
      acc[tag] = "bg-gray-500 text-white"
      return acc
    }, {} as Record<string, string>)
  }, [post.tags])

  const handleClick = () => {
    if (post.type === "outgoing_links" && post.url) {
      window.open(post.url, '_blank')
    } else {
      onToggle()
    }
  }

  return (
    <div className="relative grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 max-w-full pl-8 sm:pl-0">
      <div className="hidden sm:block text-right pt-5 pr-6 w-24 shrink-0">
        <time className="text-lg font-semibold text-muted-foreground">
          {new Date(post.date).toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric' 
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
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold tracking-tight mb-2">{post.title}</h2>
                <time className="block sm:hidden text-sm text-muted-foreground mb-2">
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {post.thumbnails.slice(0, 4).map((img, i) => (
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
            <div className="flex gap-2 flex-wrap">
              {Array.isArray(post.tags) && post.tags.map((tag) => (
                <Badge 
                  key={`${post.slug}-tag-${tag}`}
                  className={cn("text-xs rounded-full", tagColors[tag])}
                >
                  {tag}
                </Badge>
              ))}
            </div>

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

