'use client'

import { useState, useEffect, useMemo } from "react"
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"
import { MDXCard } from "./mdx-card"
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { getTagColor } from "@/lib/tag-utils"

interface Post {
  uid: string
  id?: string
  title: string
  description: string
  date: string
  tags: string[] | string | undefined
  slug: string
  type: "Skriving" | "Bok" | "Prosjekt" | "Lenkje" | "Interaktiv" | "Bilete"
  image?: string
  coverimage?: string
  content: string
  serialized?: MDXRemoteSerializeResult
  url?: string
  icon?: string
  thumbnails?: { src: string; alt: string }[]
}

const contentTypes = [
  { label: "Skriving", value: "Skriving" },
  { label: "Bok", value: "Bok" },
  { label: "Prosjekt", value: "Prosjekt" },
  { label: "Lenkje", value: "Lenkje" },
  { label: "Interaktiv", value: "Interaktiv" },
  { label: "Bilete", value: "Bilete" },
]

interface FilterButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
  variant?: "type" | "tag" | "default"
}

const FilterButton = ({ label, isActive, onClick, variant = "default" }: FilterButtonProps) => {
  const color = getTagColor(label)
  const bgColorClass = color.split(' ')[0]
  
  const baseStyles = "text-xs px-3 py-1 h-auto font-normal transition-colors"
  const variantStyles = {
    type: cn(
      "hover:bg-opacity-20 dark:hover:bg-opacity-20 rounded-full",
      isActive 
        ? color 
        : cn(bgColorClass, "bg-opacity-10 text-gray-600 dark:text-gray-400")
    ),
    tag: cn(
      "hover:bg-opacity-20 dark:hover:bg-opacity-20 rounded-sm",
      isActive 
        ? color 
        : cn(bgColorClass, "bg-opacity-10 text-gray-600 dark:text-gray-400")
    ),
    default: "bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 rounded-full"
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        baseStyles,
        variantStyles[variant]
      )}
    >
      {label}
    </Button>
  )
}

interface MDXBlogProps {
  initialPosts?: Post[]
}

export default function MDXBlog({ initialPosts = [] }: MDXBlogProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [search, setSearch] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => tagSet.add(tag.toLowerCase()))
      }
    })
    return Array.from(tagSet).sort()
  }, [posts])

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const filteredPosts = useMemo(() => {
    try {
      return posts.filter((post) => {
        const matchesSearch = (post.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
                            (post.description?.toLowerCase() || '').includes(search.toLowerCase())
        const matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(post.type)
        const matchesTags = selectedTags.length === 0 || 
                          (Array.isArray(post.tags) && post.tags.some(tag => 
                            selectedTags.includes(tag.toLowerCase())
                          ))
        return matchesSearch && matchesTypes && matchesTags
      })
    } catch (err) {
      console.error('Error filtering posts:', err)
      return []
    }
  }, [posts, search, selectedTypes, selectedTags])

  const handlePostToggle = async (uid: string) => {
    try {
      setExpandedPosts(prev => {
        const next = new Set(prev)
        if (next.has(uid)) {
          next.delete(uid)
          return next
        } 
        return next.add(uid)
      })

      const postIndex = posts.findIndex(p => p.uid === uid)
      if (postIndex === -1) return

      const post = posts[postIndex]
      if (!post.serialized && post.id) {
          try {
            const res = await fetch(`/api/posts/${post.id}`)
            if (res.ok) {
                const data = await res.json()
                if (data.source) {
                    setPosts(prev => {
                        const newPosts = [...prev]
                        newPosts[postIndex] = { ...post, serialized: data.source }
                        return newPosts
                    })
                }
            }
          } catch (e) {
            console.error("Failed to fetch post content", e)
          }
      }

    } catch (err) {
      console.error('Error toggling post:', err)
      setError('Feila ved utviding av innlegg')
    }
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 dark:text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-screen overflow-hidden">
      <aside className="w-full lg:w-48 space-y-4 shrink-0">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {contentTypes.map((type) => (
              <FilterButton
                key={type.value}
                label={type.label}
                isActive={selectedTypes.includes(type.value)}
                onClick={() => {
                  setSelectedTypes((prev) =>
                    prev.includes(type.value)
                      ? prev.filter((t) => t !== type.value)
                      : [...prev, type.value]
                  )
                }}
                variant="type"
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {uniqueTags.map((tag) => (
              <FilterButton
                key={tag}
                label={tag}
                isActive={selectedTags.includes(tag)}
                onClick={() => {
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  )
                }}
                variant="tag"
              />
            ))}
          </div>
        </div>
      </aside>
      <main className="flex-1 space-y-4 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Leit i arkivet..."
            className="pl-10 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <motion.div 
          className="relative mt-4"
          layout
          transition={{ duration: 0.2, ease: "linear" }}
        >
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => {
              const currentYear = new Date(post.date).getFullYear()
              const prevYear = index > 0 ? new Date(filteredPosts[index - 1].date).getFullYear() : null
              const showYear = currentYear !== prevYear

              return (
                <div key={post.uid}>
                  {showYear && (
                    <div className="relative grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 mb-4">
                      <div className="hidden sm:block w-24 shrink-0" />
                      <div className="relative">
                        <div className="absolute left-0 w-0.5 top-0 bottom-0 bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />
                        <div className="py-4">
                          <span className="bg-white dark:bg-gray-900 px-3 py-1 text-sm font-bold text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full relative z-10 -translate-x-1/2 inline-block">
                            {currentYear}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <MDXCard
                    post={post}
                    isExpanded={expandedPosts.has(post.uid)}
                    onToggle={() => handlePostToggle(post.uid)}
                    serializedContent={post.serialized || null}
                  />
                </div>
              )
            })
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {error ? 'Feil ved lasting av innlegg' : 'Fann ingen innlegg som passar søket.'}
            </p>
          )}
        </motion.div>
      </main>
    </div>
  )
}
