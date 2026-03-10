import MDXBlog from '@/components/mdx-blog'
import { getPublishedPosts, getPostContent, getSafeScope } from '@/lib/notion'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'

export default async function Home() {
  const posts = await getPublishedPosts()
  
  // Pre-serialize content for ALL posts on the server.
  // Using unstable_cache inside getPostContent makes this very fast after the first run.
  const postsWithContent = await Promise.all(posts.map(async (post) => {
    const id = post.id;
    if (!id) return post;

    try {
      const content = await getPostContent(id)
      const serialized = await serialize(content, {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          format: 'mdx',
        },
        scope: getSafeScope(content)
      })
      return { ...post, content, serialized }
    } catch (e) {
      console.error(`Error pre-serializing post ${post.id}:`, e)
      return post // Return original post without serialization if it fails
    }
  }))

  return (
    <div className="container w-screen px-4 py-8">
      <MDXBlog initialPosts={postsWithContent} />
    </div>
  )
}
