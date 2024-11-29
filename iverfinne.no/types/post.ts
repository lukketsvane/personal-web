// File: types/post.ts

export interface Post {
    title: string
    description: string
    date: string
    tags: string[] | string | undefined
    slug: string
    type: "writing" | "books" | "projects" | "outgoing_links"
    image?: string
    content: string
  }