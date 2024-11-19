import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface Post {
  title: string
  description: string
  date: string
  tags: string[] | string | undefined
  slug: string
  type: "writing" | "books" | "projects" | "outgoing_links"
  image?: string
  content: string
}

export async function getAllPosts(): Promise<Post[]> {
  const contentTypes = ['writing', 'books', 'projects', 'outgoing_links']
  const posts: Post[] = []

  for (const type of contentTypes) {
    const filesPath = path.join(process.cwd(), '..', type)
    console.log(`Checking directory: ${filesPath}`)
    
    if (!fs.existsSync(filesPath)) {
      console.warn(`Directory not found: ${filesPath}`)
      continue
    }

    const files = fs.readdirSync(filesPath)
    console.log(`Found ${files.length} files in ${type}`)

    for (const file of files) {
      if (path.extname(file) === '.mdx') {
        const filePath = path.join(filesPath, file)
        console.log(`Processing file: ${filePath}`)
        
        try {
          const fileContents = fs.readFileSync(filePath, 'utf8')
          const { data, content } = matter(fileContents)
          
          const imageMatch = content.match(/!\[.*?\]$$(.*?)$$/)
          const image = imageMatch ? imageMatch[1] : undefined

          posts.push({
            title: data.title || 'Untitled',
            description: data.description || '',
            date: data.date || new Date().toISOString(),
            tags: data.tags || [],
            slug: file.replace(/\.mdx$/, ''),
            type: type as "writing" | "books" | "projects" | "outgoing_links",
            image: image,
            content: content,
          })
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error)
        }
      }
    }
  }

  console.log(`Total posts processed: ${posts.length}`)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}