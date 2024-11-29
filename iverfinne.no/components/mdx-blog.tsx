'use client'

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

const WebDesignKeys = dynamic(() => import('@/components/WebDesignKeys'), {
  ssr: false,
  loading: () => <p>Loading 3D Scene...</p>
})

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
}

const contentTypes = [
  { label: "Writing", value: "writing", color: "bg-blue-500 text-white" },
  { label: "Books", value: "books", color: "bg-green-500 text-white" },
  { label: "Projects", value: "projects", color: "bg-purple-500 text-white" },
  { label: "Outgoing Links", value: "outgoing_links", color: "bg-orange-500 text-white" },
]

const categories = [
  { label: "ai", value: "ai", color: "bg-red-500 text-white" },
  { label: "no code", value: "no-code", color: "bg-yellow-500 text-white" },
  { label: "vc", value: "vc", color: "bg-green-500 text-white" },
  { label: "web3", value: "web3", color: "bg-purple-500 text-white" },
  { label: "art", value: "art", color: "bg-pink-500 text-white" },
  { label: "dev", value: "dev", color: "bg-blue-500 text-white" },
]

const FilterButton = ({ label, isActive, onClick, color, variant = "default" }: { 
  label: string
  isActive: boolean
  onClick: () => void
  color?: string
  variant?: "type" | "category" | "default"
}) => {
  const baseStyles = "text-xs px-3 py-1 h-auto font-normal transition-colors"
  const variantStyles = {
    type: cn(
      "hover:bg-gray-100 dark:hover:bg-gray-800",
      isActive ? color : "text-gray-600 dark:text-gray-400"
    ),
    category: cn(
      "hover:bg-gray-100 dark:hover:bg-gray-800",
      isActive ? color : "text-gray-600 dark:text-gray-400"
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

const TimelineConnector = () => (
  <div className="absolute left-0 w-0.5 top-5 bottom-0 bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />
)

const TimelineNode = ({ type }: { type: string }) => {
  const typeColor = contentTypes.find(t => t.value === type)?.color.split(' ')[0] || "bg-gray-500"
  return (
    <div className={cn(
      "absolute left-0 top-1 w-4 h-4 rounded-full -translate-x-1/2 border-2 border-white dark:border-gray-900 z-10",
      typeColor
    )} />
  )
}

const PostItem = ({ post, isExpanded, onToggle }: { 
  post: Post
  isExpanded: boolean
  onToggle: () => void 
}) => {
  const [serializedContent, setSerializedContent] = useState<MDXRemoteSerializeResult | null>(null)

  useEffect(() => {
    if (isExpanded && !serializedContent) {
      serialize(post.content, { 
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          format: 'mdx',
          development: false,
        },
        parseFrontmatter: true,
      }).then((result) => setSerializedContent(result))
    }
  }, [isExpanded, post.content, serializedContent])

  const tagColors = useMemo(() => {
    if (!Array.isArray(post.tags)) return {}
    return post.tags.reduce((acc, tag) => {
      const category = categories.find(c => c.value === tag.toLowerCase())
      acc[tag] = category?.color || "bg-gray-500 text-white"
      return acc
    }, {} as Record<string, string>)
  }, [post.tags])

  return (
    <div className="relative grid grid-cols-[auto,1fr] gap-4">
      <div className="text-right text-xs text-gray-500 dark:text-gray-400 pt-1 pr-4 w-24">
        {new Date(post.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
      </div>
      <div className="relative">
        <TimelineNode type={post.type} />
        <TimelineConnector />
        <div className="pb-8">
          <motion.article 
            className={cn(
              "relative rounded-lg p-4 cursor-pointer transition-all", 
              isExpanded ? "bg-blue-50 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800",
              post.type === "outgoing_links" && "hover:cursor-alias"
            )}
            onClick={() => {
              if (post.type === "outgoing_links" && post.url) {
                window.open(post.url, '_blank')
              } else {
                onToggle()
              }
            }}
            initial={false}
            animate={{ backgroundColor: isExpanded ? "#f0f9ff" : "transparent" }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <div className="flex items-center gap-4 mb-2">
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
              <h2 className="text-lg font-semibold">{post.title}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">
              {post.description}
            </p>
            <div className="flex gap-2 mb-2">
              {Array.isArray(post.tags) 
                ? post.tags.slice(0, 2).map((tag) => (
                    <Badge 
                      key={tag} 
                      className={cn("text-xs rounded-full", tagColors[tag])}
                    >
                      {tag}
                    </Badge>
                  ))
                : post.tags && (
                    <Badge className="text-xs rounded-full bg-gray-500 text-white">
                      {post.tags}
                    </Badge>
                  )
              }
              {Array.isArray(post.tags) && post.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{post.tags.length - 2}</span>
              )}
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="overflow-hidden mt-2"
                >
                  {post.slug === "aho-slot" ? (
                    <div className="w-full aspect-[4/5] rounded-lg overflow-hidden">
                      <iframe
                        src="https://aho-slot.vercel.app/"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : post.slug === "web-design-keys" ? (
                    <div className="w-full aspect-[4/5] rounded-lg overflow-hidden">
                      <WebDesignKeys />
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none text-sm">
                      {serializedContent && (
                        <MDXRemote
                          {...serializedContent}
                          components={{
                            h1: (props) => <h1 {...props} className="text-2xl font-bold mt-4 mb-2" />,
                            h2: (props) => <h2 {...props} className="text-xl font-semibold mt-3 mb-2" />,
                            h3: (props) => <h3 {...props} className="text-lg font-medium mt-2 mb-1" />,
                            h4: (props) => <h4 {...props} className="text-base font-medium mt-2 mb-1" />,
                            h5: (props) => <h5 {...props} className="text-sm font-medium mt-2 mb-1" />,
                            h6: (props) => <h6 {...props} className="text-xs font-medium mt-2 mb-1" />,
                          }}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        </div>
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
    <div className="flex flex-col lg:flex-row gap-4 p-4">
      <aside className="w-full lg:w-48 space-y-4">
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
          <h2 className="text-xs font-medium text-gray-500 lowercase">categories</h2>
          <div className="flex flex-wrap gap-1.5">
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
                color={category.color}
                variant="category"
              />
            ))}
          </div>
        </div>
      </aside>
      <main className="flex-1 space-y-4">
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

