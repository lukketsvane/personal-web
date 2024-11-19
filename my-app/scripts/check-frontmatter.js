const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentTypes = ['writing', 'books', 'projects', 'outgoing_links'];

contentTypes.forEach(type => {
  const filesPath = path.join(process.cwd(), '..', type);
  const files = fs.readdirSync(filesPath);

  files.forEach(file => {
    if (path.extname(file) === '.mdx') {
      const filePath = path.join(filesPath, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      
      try {
        matter(fileContents);
        console.log(`✅ ${type}/${file}: Frontmatter is valid`);
      } catch (error) {
        console.error(`❌ ${type}/${file}: Error parsing frontmatter:`, error.message);
      }
    }
  });
});