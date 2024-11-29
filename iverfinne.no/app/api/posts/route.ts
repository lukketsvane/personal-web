import { NextResponse } from 'next/server'
import { getAllPosts } from './utils/posts'
import { Post } from '@/types/post'

export async function GET() {
  try {
    const posts: Post[] = await getAllPosts()
    if (posts.length === 0) {
      return NextResponse.json({ 
        message: 'No posts found. Make sure you have .mdx files in the content directories.',
        setup: 'To add posts, create .mdx files in the content/projects, content/writing, content/books, or content/outgoing_links directories with appropriate frontmatter.'
      }, { status: 404 })
    }
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

