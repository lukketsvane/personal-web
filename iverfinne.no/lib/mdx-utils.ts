import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { Post } from '@/types/post'

export async function getAllPosts(): Promise<Post[]> {
  const contentTypes = ['writing', 'books', 'projects', 'outgoing_links'] as const
  const posts: Post[] = []

  for (const type of contentTypes) {
    const filesPath = path.join(process.cwd(), type)
    console.log(`Checking directory: ${filesPath}`)
    
    try {
      const files = await fs.readdir(filesPath)
      console.log(`Found ${files.length} files in ${type}`)

      for (const file of files) {
        if (path.extname(file) === '.mdx') {
          const filePath = path.join(filesPath, file)
          console.log(`Processing file: ${filePath}`)
          
          try {
            const fileContents = await fs.readFile(filePath, 'utf8')
            const { data, content } = matter(fileContents)
            
            const imageMatch = content.match(/!\[.*?\]$$(.*?)$$/)
            const image = imageMatch ? imageMatch[1] : undefined

            posts.push({
              title: data.title || 'Untitled',
              description: data.description || '',
              date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
              tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
              slug: file.replace(/\.mdx$/, ''),
              type: type,
              image: image,
              content: content,
            })
          } catch (error) {
            console.error(`Error processing file ${filePath}:`, error)
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${filesPath}:`, error)
    }
  }

  console.log(`Total posts processed: ${posts.length}`)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}