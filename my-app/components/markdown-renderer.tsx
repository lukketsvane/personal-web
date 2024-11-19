'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import OutgoingLink from './outgoing-link'
import MarkdownRenderer from './markdown-renderer'
import { formatDate, cn } from '@/lib/utils'

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
}

const contentTypes = [
  { label: "Writing", value: "writing", color: "bg-blue-500" },
  { label: "Books", value: "books", color: "bg-green-500" },
  { label: "Projects", value: "projects", color: "bg-purple-500" },
  { label: "Outgoing Links", value: "outgoing_links", color: "bg-orange-500" },
]

const categories = [
  { label: "AI", value: "ai" },
  { label: "No Code", value: "no-code" },
  { label: "VC", value: "vc" },
  { label: "Web3", value: "web3" },
  { label: "Art", value: "art" },
  { label: "Dev", value: "dev" },
]

const TimelineNode = ({ type }: { type: string }) => {
  const typeColor = contentTypes.find(t => t.value === type)?.color || "bg-gray-500"
  return (
    <div className={cn(
      "absolute left-1/2 lg:left-0 w-3 h-3 rounded-full -translate-x-1/2 lg:translate-x-0",
      "border-2 border-white dark:border-gray-900",
      typeColor
    )} />
  )
}

const TimelineConnector = () => (
  <div className="absolute left-1/2 lg:left-0 w-px h-full bg-gray-200 dark:bg-gray-700 -translate-x-1/2 lg:translate-x-[1.5px]" />
)

const PostItem = ({ post, isExpanded, onToggle }: { 
  post: Post
  isExpanded: boolean
  onToggle: () => void 
}) => {
  return (
    <div className="relative">
      <TimelineNode type={post.type} />
      <TimelineConnector />
      <div className="grid grid-cols-1 lg:grid-cols-[120px_1fr] gap-4">
        <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400 pt-0.5">
          {formatDate(post.date)}
        </div>
        <motion.article 
          className={cn(
            "relative ml-8 lg:ml-0 rounded-lg p-4 cursor-pointer transition-all",
            isExpanded ? "bg-blue-50 dark:bg-gray-800/50" : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
          )}
          onClick={onToggle}
          initial={false}
          animate={{ backgroundColor: isExpanded ? "rgba(239, 246, 255, 0.6)" : "transparent" }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
        >
          <div className="lg:hidden text-sm text-gray-500 dark:text-gray-400 mb-2">
            {formatDate(post.date)}
          </div>
          <Link href={`/${post.type}/${post.slug}`}>
            <h2 className="text-lg font-semibold mb-2 text-blue-500 hover:text-blue-600 transition-colors">
              {post.title}
            </h2>
          </Link>
          <div className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {post.description}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {Array.isArray(post.tags) ? post.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                {tag}
              </Badge>
            )) : post.tags && (
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                {post.tags}
              </Badge>
            )}
          </div>
          {isExpanded && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.2 }}
                className="overflow-hidden mt-4"
              >
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <MarkdownRenderer content={post.content} />
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.article>
      </div>
    </div>
  )
}

export default function MDXBlog({ initialPosts = [] }: { initialPosts?: Post[] }) {
  const [posts] = useState<Post[]>(initialPosts)
  const [search, setSearch] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
                            post.description.toLowerCase().includes(search.toLowerCase())
      const matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(post.type)
      const matchesCategories = selectedCategories.length === 0 || 
                                (Array.isArray(post.tags) && post.tags.some(tag => selectedCategories.includes(tag.toLowerCase())))
      return matchesSearch && matchesTypes && matchesCategories
    })
  }, [posts, search, selectedTypes, selectedCategories])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 p-4">
        <aside className="w-full lg:w-48 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search..."
              className="pl-10 py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h2>
            <div className="flex flex-wrap gap-1.5">
              {contentTypes.map((type) => (
                <Badge
                  key={type.value}
                  variant="secondary"
                  className={cn(
                    "cursor-pointer text-xs px-2 py-0.5",
                    selectedTypes.includes(type.value)
                      ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  )}
                  onClick={() => {
                    setSelectedTypes((prev) =>
                      prev.includes(type.value)
                        ? prev.filter((t) => t !== type.value)
                        : [...prev, type.value]
                    )
                  }}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</h2>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => (
                <Badge
                  key={category.value}
                  variant="secondary"
                  className={cn(
                    "cursor-pointer text-xs px-2 py-0.5",
                    selectedCategories.includes(category.value)
                      ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  )}
                  onClick={() => {
                    setSelectedCategories((prev) =>
                      prev.includes(category.value)
                        ? prev.filter((c) => c !== category.value)
                        : [...prev, category.value]
                    )
                  }}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>
        </aside>
        <main className="flex-1">
          <div className="space-y-12">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostItem 
                  key={post.slug} 
                  post={post} 
                  isExpanded={expandedPost === post.slug}
                  onToggle={() => setExpandedPost(expandedPost === post.slug ? null : post.slug)}
                />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No posts found matching your criteria.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}