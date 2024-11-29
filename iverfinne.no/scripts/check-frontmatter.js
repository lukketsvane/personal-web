import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const contentTypes = ['writing', 'books', 'projects', 'outgoing_links'];

async function checkFrontmatter() {
  for (const type of contentTypes) {
    const filesPath = path.join(process.cwd(), '..', type);
    try {
      const files = await fs.readdir(filesPath);
      for (const file of files) {
        if (path.extname(file) === '.mdx') {
          const filePath = path.join(filesPath, file);
          const fileContents = await fs.readFile(filePath, 'utf8');
          
          try {
            matter(fileContents);
            console.log(`✅ ${type}/${file}: Frontmatter is valid`);
          } catch (error) {
            console.error(`❌ ${type}/${file}: Error parsing frontmatter:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${type}:`, error);
    }
  }
}

checkFrontmatter().catch(console.error);