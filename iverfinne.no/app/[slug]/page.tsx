import { getPublishedPosts, getPostBySlug } from '@/lib/notion'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'
import { ImageGallery } from "@/components/image-gallery"
import { ResponsiveIframe } from "@/components/responsive-iframe"
import { ModelViewer } from "@/components/model-viewer"
import WebDesignKeys from '@/components/WebDesignKeys'

const components = {
  h1: (props: any) => <h1 {...props} className="text-3xl font-bold mt-8 mb-4 break-words" />,
  h2: (props: any) => <h2 {...props} className="text-2xl font-semibold mt-6 mb-3 break-words" />,
  h3: (props: any) => <h3 {...props} className="text-xl font-medium mt-4 mb-2 break-words" />,
  p: (props: any) => <p {...props} className="mb-4 leading-relaxed break-words" />,
  img: (props: any) => <img {...props} className="max-w-full h-auto rounded-lg my-6" />,
  ImageGallery,
  ResponsiveIframe,
  ModelViewer,
  WebDesignKeys,
  material: (props: any) => <div {...props} />,
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="container max-w-4xl mx-auto px-4 py-12">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Tilbake til forsida
      </Link>

      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.date}>
              <span className="font-extrabold">{new Date(post.date).getDate()}.</span>{' '}
              {new Date(post.date).toLocaleDateString('nn-NO', {
                month: 'long',
                year: 'numeric'
              })}
            </time>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {post.type}
            </Badge>
          </div>

          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4" />
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="prose dark:prose-invert max-w-none">
        <MDXRemote 
          source={post.content} 
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
            scope: {
              material: {}, tid: {}, geografi: {}, geometri: {}, design: {}, kultur: {}, norsk: {}, historie: {}, 
              materiale: {}, skriving: {}, teknologi: {}, kunst: {}, filosofi: {}, berekraft: {}, landbruk: {},
              innovasjon: {}, utdanning: {}, spel: {}, fotografi: {}, marknadsføring: {}, verktøy: {}, skisser: {},
              algoritmar: {}, kreativitet: {}, automatisering: {}, tilgjenge: {}, datastrukturar: {}
            }
          }}
        />
      </div>
    </article>
  )
}
