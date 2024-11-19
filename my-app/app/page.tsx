import MDXBlogWrapper from '@/components/mdx-blog-wrapper'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My MDX Blog</h1>
      <MDXBlogWrapper />
    </div>
  )
}