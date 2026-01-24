import { NextResponse } from 'next/server'
import { getPublishedPosts } from '@/lib/notion'

// Revalidate every hour (3600 seconds) or less if you want faster updates
// For "streaming" feel, we can set this to 60 or 0 (dynamic)
export const revalidate = 60; 

export async function GET() {
  try {
    console.log('Fetching posts from Notion...');
    const posts = await getPublishedPosts()
    console.log(`Successfully fetched ${posts.length} posts`);
    
    if (posts.length === 0) {
       console.log('No posts found with status "Done"');
       return NextResponse.json([])
    }
    return NextResponse.json(posts)
  } catch (error: any) {
    console.error('Error fetching posts from Notion:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch posts',
      details: error.message 
    }, { status: 500 })
  }
}

