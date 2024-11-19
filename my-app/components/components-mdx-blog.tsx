"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

interface Post {
  title: string
  description: string
  date: string
  tags: string[]
  slug: string
  type: "writing" | "books" | "projects" | "outgoing_links"
  image?: string
}

interface Category {
  label: string
  value: string
}

const categories: Category[] = [
  { label: "AI", value: "ai" },
  { label: "No Code", value: "no-code" },
  { label: "VC", value: "vc" },
  { label: "Web3", value: "web3" },
  { label: "Art", value: "art" },
  { label: "Dev", value: "dev" },
]

const types = [
  { label: "Writing", value: "writing" },
  { label: "Books", value: "books" },
  { label: "Projects", value: "projects" },
  { label: "Outgoing Links", value: "outgoing_links" },
]

const tutorials = [
  { label: "Video", value: "video" },
  { label: "Template", value: "template" },
  { label: "Live Tweet", value: "live-tweet" },
]

export function MdxBlog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  useEffect(() => {
    async function loadPosts() {
      const allPosts = await getMDXFiles()
      setPosts(allPosts)
    }
    loadPosts()
  }, [])

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
                          post.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategories = selectedCategories.length === 0 ||
                              post.tags.some(tag => selectedCategories.includes(tag))
    const matchesTypes = selectedTypes.length === 0 ||
                         selectedTypes.includes(post.type)
    return matchesSearch && matchesCategories && matchesTypes
  })

  return (
    <div className="flex min-h-screen w-full gap-8 p-4 md:p-6">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col space-y-6 md:flex">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Type</h2>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Badge
                key={type.value}
                variant="secondary"
                className={`cursor-pointer ${
                  selectedTypes.includes(type.value)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
                onClick={() => {
                  setSelectedTypes((prev) =>
                    prev.includes(type.value)
                      ? prev.filter((t) => t !== type.value)
                      : [...prev, type.value]
                  )
                }}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Tutorials</h2>
          <div className="flex flex-wrap gap-2">
            {tutorials.map((tutorial) => (
              <Badge
                key={tutorial.value}
                variant="secondary"
                className="cursor-pointer bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
              >
                {tutorial.label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant="secondary"
                className={`cursor-pointer ${
                  selectedCategories.includes(category.value)
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                }`}
                onClick={() => {
                  setSelectedCategories((prev) =>
                    prev.includes(category.value)
                      ? prev.filter((c) => c !== category.value)
                      : [...prev, category.value]
                  )
                }}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 space-y-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Type here to search"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative space-y-8">
          {filteredPosts.map((post, index) => (
            <div key={post.slug} className="relative">
              {index !== 0 && (
                <div className="absolute -top-4 left-[7px] h-4 w-[2px] bg-border" />
              )}
              <div className="flex gap-4">
                <div className="relative flex w-4 items-center justify-center">
                  <div className="absolute h-full w-[2px] bg-border" />
                  <div className="relative h-4 w-4 rounded-full border bg-background" />
                </div>
                <div className="flex-1 space-y-2 pb-8">
                  <div className="text-sm text-muted-foreground">{post.date}</div>
                  <Link href={`/${post.type}/${post.slug}`}>
                    <h2 className="text-2xl font-bold text-blue-500 hover:underline">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-muted-foreground">{post.description}</p>
                  {post.image && (
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={300}
                      height={200}
                      className="rounded-md object-cover"
                    />
                  )}
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

async function getMDXFiles(): Promise<Post[]> {
  const contentTypes = ['writing', 'books', 'projects', 'outgoing_links']
  const allFiles: Post[] = []

  for (const type of contentTypes) {
    const dirPath = path.join(process.cwd(), type)
    const files = fs.readdirSync(dirPath)

    for (const file of files) {
      if (path.extname(file) === '.mdx') {
        const filePath = path.join(dirPath, file)
        const source = fs.readFileSync(filePath, 'utf-8')
        const { data, content } = matter(source)
        
        // Extract the first image from the content if it exists
        const imageMatch = content.match(/!\[.*?\]$$(.*?)$$/)
        const image = imageMatch ? imageMatch[1] : undefined

        allFiles.push({
          title: data.title,
          description: data.description,
          date: data.date,
          tags: data.tags,
          slug: file.replace(/\.mdx$/, ''),
          type: type as "writing" | "books" | "projects" | "outgoing_links",
          image: image,
        })
      }
    }
  }

  return allFiles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}