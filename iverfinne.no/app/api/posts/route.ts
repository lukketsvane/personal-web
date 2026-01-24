import { NextResponse } from 'next/server'
import { getPublishedPosts } from '@/lib/notion'

// Revalidate every hour (3600 seconds) or less if you want faster updates
// For "streaming" feel, we can set this to 60 or 0 (dynamic)
export const revalidate = 60; 

export async function GET() {
  try {
    const posts = await getPublishedPosts()
    if (posts.length === 0) {
       // Return empty array instead of 404 to avoid breaking UI
       return NextResponse.json([])
    }
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts from Notion:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

