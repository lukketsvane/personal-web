"use client"

import { useEffect, useState } from 'react'
import MDXBlog from '@/components/mdx-blog'

interface Post {
  title: string
  description: string
  date: string
  tags: string[] | string | undefined
  slug: string
  type: "writing" | "books" | "projects" | "outgoing_links"
  image?: string
  content: string
}

export default function MDXBlogWrapper() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Fetched posts:', data)
        setPosts(data)
      } catch (error) {
        console.error('Error fetching posts:', error)
        setError('Failed to fetch posts. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return posts.length > 0 ? (
    <MDXBlog initialPosts={posts} />
  ) : (
    <p>No posts found.</p>
  )
}

