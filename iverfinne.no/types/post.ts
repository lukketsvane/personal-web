export interface Post {
  uid: string
  id?: string // Notion Page ID
  title: string
  description: string
  date: string
  tags: string[] | string | undefined
  slug: string
  type: "writing" | "books" | "projects" | "outgoing_links"
  image?: string
  content: string
  url?: string
  icon?: string
  thumbnails?: { src: string; alt: string }[]
}

