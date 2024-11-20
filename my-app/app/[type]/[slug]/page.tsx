import fs from 'fs'
import path from 'path'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { compileMDX } from 'next-mdx-remote/rsc'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const contentTypes = ['writing', 'books', 'projects', 'outgoing_links']
  const paths = []

  for (const type of contentTypes) {
    const filesPath = path.join(process.cwd(), '..', type)
    const files = fs.readdirSync(filesPath)

    for (const file of files) {
      if (path.extname(file) === '.mdx') {
        paths.push({
          type: type,
          slug: file.replace(/\.mdx$/, ''),
        })
      }
    }
  }

  return paths
}

export default async function Post({ params }: { params: { type: string; slug: string } }) {
  const filePath = path.join(process.cwd(), '..', params.type, `${params.slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    notFound()
  }

  const source = fs.readFileSync(filePath, 'utf8')
  const { content, frontmatter } = await compileMDX({
    source,
    options: { parseFrontmatter: true },
  })

  return (
    <article className="prose dark:prose-invert mx-auto mt-8">
      <h1>{frontmatter.title}</h1>
      <p className="text-gray-500">Published on: {frontmatter.date}</p>
      <MDXRemote source={content} />
    </article>
  )
}