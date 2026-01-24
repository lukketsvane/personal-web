import { NextResponse } from 'next/server'
import { getPostContent } from '@/lib/notion'

export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id
    const content = await getPostContent(id)
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching post content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}
