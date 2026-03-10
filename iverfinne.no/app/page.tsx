import MDXBlog from '@/components/mdx-blog'
import { getPublishedPosts } from '@/lib/notion'

export default async function Home() {
  const posts = await getPublishedPosts()
  
  return (
    <div className="container w-screen px-4 py-8">
      <MDXBlog initialPosts={posts} />
    </div>
  )
}

