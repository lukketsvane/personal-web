'use client'

import { useState, useEffect, useMemo } from "react"
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"
import { MDXCard } from "./mdx-card"
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'

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

const contentTypes = [
  { label: "Writing", value: "writing", color: "bg-blue-500 text-white" },
  { label: "Books", value: "books", color: "bg-green-500 text-white" },
  { label: "Projects", value: "projects", color: "bg-purple-500 text-white" },
  { label: "Outgoing Links", value: "outgoing_links", color: "bg-orange-500 text-white" },
]

interface FilterButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
  color?: string
  variant?: "type" | "tag" | "default"
}

const FilterButton = ({ label, isActive, onClick, color, variant = "default" }: FilterButtonProps) => {
  const bgColorClass = color?.split(' ')[0]
  
  const baseStyles = "text-xs px-3 py-1 h-auto font-normal transition-colors"
  const variantStyles = {
    type: cn(
      "hover:bg-opacity-20 dark:hover:bg-opacity-20",
      isActive 
        ? color 
        : cn(bgColorClass, "bg-opacity-10 text-gray-600 dark:text-gray-400")
    ),
    tag: cn(
      "hover:bg-opacity-20 dark:hover:bg-opacity-20",
      isActive 
        ? color 
        : cn(bgColorClass, "bg-opacity-10 text-gray-600 dark:text-gray-400")
    ),
    default: "bg-gray-100/50 hover:bg-gray-200/50 text-gray-600"
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        baseStyles,
        variantStyles[variant],
        "rounded-full"
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
  const [serializedContents, setSerializedContents] = useState<Record<string, MDXRemoteSerializeResult | null>>({})
  const [error, setError] = useState<string | null>(null)
  const [showAllTags, setShowAllTags] = useState(false)

  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => tagSet.add(tag.toLowerCase()))
      }
    })
    return Array.from(tagSet).sort()
  }, [posts])

  const displayTags = useMemo(() => {
    return showAllTags ? uniqueTags : uniqueTags.slice(0, 5)
  }, [uniqueTags, showAllTags])

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  useEffect(() => {
    const serializeContent = async (slug: string, content: string) => {
      if (!serializedContents[slug] && expandedPosts.has(slug)) {
        try {
          const result = await serialize(content, {
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              format: 'mdx',
              development: process.env.NODE_ENV === 'development',
            },
            parseFrontmatter: true,
          })
          setSerializedContents(prev => ({ ...prev, [slug]: result }))
        } catch (error) {
          console.error('Error serializing MDX for slug:', slug, error)
          setSerializedContents(prev => ({ ...prev, [slug]: null }))
        }
      }
    }

    expandedPosts.forEach(slug => {
      const post = posts.find(p => p.slug === slug)
      if (post?.content) {
        serializeContent(post.slug, post.content)
      }
    })
  }, [expandedPosts, posts, serializedContents])

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

  const handlePostToggle = (slug: string) => {
    try {
      setExpandedPosts(prev => {
        const next = new Set(prev)
        if (next.has(slug)) {
          next.delete(slug)
        } else {
          next.add(slug)
        }
        return next
      })
    } catch (err) {
      console.error('Error toggling post:', err)
      setError('Failed to expand post')
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
          <h2 className="text-xs font-medium text-gray-500 lowercase">type</h2>
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
                color={type.color}
                variant="type"
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-gray-500 lowercase">tags</h2>
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag) => (
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
                color="bg-gray-500 text-white"
                variant="tag"
              />
            ))}
            {uniqueTags.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllTags(!showAllTags)}
                className="text-xs px-3 py-1 h-auto font-normal rounded-full text-blue-500 hover:text-blue-600"
              >
                {showAllTags ? 'Show less' : `+${uniqueTags.length - 5} more`}
              </Button>
            )}
          </div>
        </div>
      </aside>
      <main className="flex-1 space-y-4 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Type here to search"
            className="pl-10 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <motion.div 
          className="relative mt-4"
          layout
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <MDXCard
                key={post.slug}
                post={post}
                isExpanded={expandedPosts.has(post.slug)}
                onToggle={() => handlePostToggle(post.slug)}
                serializedContent={serializedContents[post.slug]}
              />
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {error ? 'Error loading posts' : 'No posts found matching your criteria.'}
            </p>
          )}
        </motion.div>
      </main>
    </div>
  )
}

