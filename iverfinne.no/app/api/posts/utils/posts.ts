import path from 'path'
import fs from 'fs/promises'
import matter from 'gray-matter'
import { Post } from '@/types/post'

const CONTENT_DIRECTORIES = ['projects', 'writing', 'books', 'outgoing_links']

async function getPostsFromDirectory(directory: string): Promise<Post[]> {
  const postsDirectory = path.join(process.cwd(), 'content', directory)
  
  try {
    await fs.access(postsDirectory)
  } catch (error) {
    console.warn(`Directory ${postsDirectory} does not exist. Creating it now.`)
    await fs.mkdir(postsDirectory, { recursive: true })
    return []
  }

  const fileNames = await fs.readdir(postsDirectory)
  const mdxFiles = fileNames.filter(fileName => fileName.endsWith('.mdx'))

  if (mdxFiles.length === 0) {
    console.warn(`No .mdx files found in the ${directory} directory`)
    return []
  }

  const posts = await Promise.all(
    mdxFiles.map(async fileName => {
      try {
        const filePath = path.join(postsDirectory, fileName)
        const fileContent = await fs.readFile(filePath, 'utf8')
        const { data, content } = matter(fileContent)
        
        return {
          title: data.title || 'Untitled',
          description: data.description || '',
          date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          tags: data.tags || [],
          type: data.type || directory,
          slug: fileName.replace(/\.mdx$/, ''),
          content: content,
          ...(data.image && { image: data.image }),
          ...(data.url && { url: data.url }),
          ...(data.icon && { icon: data.icon }),
          thumbnails: data.thumbnails || [],
        } as Post
      } catch (error) {
        console.error(`Error processing file ${fileName} in ${directory}:`, error)
        return null
      }
    })
  )

  return posts.filter((post): post is Post => post !== null)
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const allPosts = await Promise.all(
      CONTENT_DIRECTORIES.map(directory => getPostsFromDirectory(directory))
    )

    const flattenedPosts = allPosts.flat()

    // Sort posts by date, latest first
    return flattenedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error reading posts:', error)
    return []
  }
}

