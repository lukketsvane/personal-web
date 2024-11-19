import React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from '@/lib/utils'

interface OutgoingLink {
  title: string
  description: string
  date: string
  tags: string[]
  type: string
  category: string
  url: string
}

interface OutgoingLinksGridProps {
  links: OutgoingLink[]
}

export default function OutgoingLinksGrid({ links }: OutgoingLinksGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {links.map((link, index) => (
        <Card key={index} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              <Link href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                {link.title}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </CardTitle>
            <CardDescription>{link.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground mb-2">{formatDate(link.date)}</p>
            <div className="flex flex-wrap gap-2">
              {link.tags.map((tag, tagIndex) => (
                <Badge key={tagIndex} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
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