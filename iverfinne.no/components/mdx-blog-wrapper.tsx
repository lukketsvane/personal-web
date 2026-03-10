'use client'

import { useEffect, useState } from 'react'
import MDXBlog from '@/components/mdx-blog'

import type { MDXRemoteSerializeResult } from 'next-mdx-remote'

interface Post {
  uid: string
  id?: string
  title: string
  description: string
  date: string
  tags: string[] | string | undefined
  slug: string
  type: "Skriving" | "Bok" | "Prosjekt" | "Lenkje"
  image?: string
  content: string
  serialized?: MDXRemoteSerializeResult
  thumbnails?: { src: string; alt: string }[]
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
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Fetched posts:', data)
        setPosts(data)
      } catch (error: any) {
        console.error('Error fetching posts:', error)
        setError(error.message || 'Feil ved henting av innlegg. Prøv igjen seinare.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">.</div>
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
        <p className="font-medium">Feil ved lasting av innlegg</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Prøv igjen
        </button>
      </div>
    )
  }

  return posts.length > 0 ? (
    <MDXBlog initialPosts={posts} />
  ) : (
    <p>Fann ingen innlegg.</p>
  )
}

