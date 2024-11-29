import React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from '@/lib/utils'
import dynamic from 'next/dynamic'

const WebDesignKeys = dynamic(() => import('@/components/WebDesignKeys'), {
  ssr: false,
  loading: () => <p>Loading 3D Scene...</p>
})

interface OutgoingLink {
  title: string
  description: string
  date: string
  tags: string[]
  type: string
  category: string
  url: string
  slug: string
}

interface OutgoingLinksGridProps {
  links: OutgoingLink[]
}

export default function OutgoingLinksGrid({ links }: OutgoingLinksGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {links.map((link) => (
        <Card key={link.url} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              <Link 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline flex items-center gap-2 text-primary"
                aria-label={`${link.title} (opens in a new tab)`}
              >
                {link.title}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardTitle>
            <CardDescription>{link.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground mb-2">
              <time dateTime={link.date}>{formatDate(link.date)}</time>
            </p>
            <div className="flex flex-wrap gap-2">
              {link.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            {link.slug === 'web-design-keys' && (
              <div className="mt-4 w-full aspect-[4/5] rounded-lg overflow-hidden">
                <WebDesignKeys />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Badge variant="outline" className="text-xs capitalize">
              {link.category}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {link.type}
            </Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}