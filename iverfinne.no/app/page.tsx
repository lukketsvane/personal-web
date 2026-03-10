import MDXBlog from '@/components/mdx-blog'
import { getPublishedPosts, getPostContent } from '@/lib/notion'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'

export default async function Home() {
  const posts = await getPublishedPosts()
  
  // Pre-serialize content for ALL posts on the server.
  // Using unstable_cache inside getPostContent makes this very fast after the first run.
  const postsWithContent = await Promise.all(posts.map(async (post) => {
    try {
      const content = await getPostContent(post.id)
      const serialized = await serialize(content, {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          format: 'mdx',
        },
        scope: {
          material: "", tid: "", geografi: "", geometri: "", design: "", kultur: "", norsk: "", historie: "", 
          materiale: "", skriving: "", teknologi: "", kunst: "", filosofi: "", berekraft: "", landbruk: "",
          innovasjon: "", utdanning: "", spel: "", fotografi: "", marknadsføring: "", verktøy: "", skisser: "",
          algoritmar: "", kreativitet: "", automatisering: "", tilgjenge: "", datastrukturar: ""
        }
      })
      return { ...post, serialized }
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
