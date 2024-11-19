"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Search, Calendar, Tag, ExternalLink } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { motion, AnimatePresence } from 'framer-motion'
import OutgoingLink from './outgoing-link'
import { formatDate } from '@/lib/utils'

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
    <div className={`absolute left-0 w-4 h-4 rounded-full -translate-x-1/2 ${typeColor} border-2 border-white dark:border-gray-900`} />
  )
}

const TimelineConnector = () => (
  <div className="absolute left-0 w-0.5 h-full bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />
)

const PostItem = ({ post, isExpanded, onToggle }: { 
  post: Post
  isExpanded: boolean
  onToggle: () => void 
}) => {
  const [serializedContent, setSerializedContent] = useState<any>(null)

  useEffect(() => {
    if (isExpanded && !serializedContent) {
      serialize(post.content).then(setSerializedContent)
    }
  }, [isExpanded, post.content, serializedContent])

  const typeColor = contentTypes.find(t => t.value === post.type)?.color || "bg-gray-500"

  return (
    <div className="relative pl-8 pb-8">
      <TimelineNode type={post.type} />
      <TimelineConnector />
      <motion.article 
        className="relative rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        onClick={onToggle}
        initial={false}
        animate={{ 
          backgroundColor: isExpanded ? "#f0f9ff" : "transparent",
        }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.2
        }}
      >
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {formatDate(post.date)}
        </div>
        <motion.h2 
          className={`text-lg font-semibold mb-1 ${typeColor.replace('bg-', 'text-')}`}
          animate={{ 
            color: isExpanded ? typeColor.replace('bg-', 'text-') : "inherit"
          }}
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: 0.2
          }}
        >
          {post.title}
        </motion.h2>
        {post.type === "books" && post.coverimage && (
          <div className="my-4">
            <Image
              src={post.coverimage}
              alt={`Cover for ${post.title}`}
              width={120}
              height={180}
              className="rounded-md shadow-md"
            />
          </div>
        )}
        <motion.p 
          className="text-gray-600 dark:text-gray-300 mb-2 text-sm"
          animate={{ opacity: isExpanded ? 0.7 : 1 }}
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: 0.2
          }}
        >
          {post.description}
        </motion.p>
        <div className="flex flex-wrap gap-1 mb-2">
          {Array.isArray(post.tags) ? post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
              {tag}
            </Badge>
          )) : post.tags && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {post.tags}
            </Badge>
          )}
        </div>
        {post.url && (
          <OutgoingLink href={post.url}>
            Visit {post.type === "outgoing_links" ? "Link" : post.type}
          </OutgoingLink>
        )}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.2
              }}
              className="overflow-hidden mt-2"
            >
              <div className="prose dark:prose-invert max-w-none text-sm">
                {serializedContent && <MDXRemote {...serializedContent} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </div>
  )
}

const FilterButton = ({ label, isActive, onClick, color }: { label: string; isActive: boolean; onClick: () => void; color?: string }) => (
  <Button
    variant={isActive ? "default" : "outline"}
    size="sm"
    onClick={onClick}
    className={`text-xs px-2 py-1 h-auto ${isActive ? color : ''}`}
  >
    {label}
  </Button>
)

export default function MDXBlog({ initialPosts }: { initialPosts: Post[] }) {
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
    <div className="flex flex-col lg:flex-row gap-8 p-4">
      <aside className="w-full lg:w-64 space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Type</h2>
          <div className="flex flex-wrap gap-2">
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
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <FilterButton
                key={category.value}
                label={category.label}
                isActive={selectedCategories.includes(category.value)}
                onClick={() => {
                  setSelectedCategories((prev) =>
                    prev.includes(category.value)
                      ? prev.filter((c) => c !== category.value)
                      : [...prev, category.value]
                  )
                }}
              />
            ))}
          </div>
        </div>
      </aside>
      <main className="flex-1 space-y-6">
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
          className="relative mt-8 pl-16"
          transition={{
            type: "tween",
            ease: "easeInOut",
            duration: 0.2
          }}
        >
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
        </motion.div>
      </main>
    </div>
  )
}