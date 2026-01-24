const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const matter = require("gray-matter");

// Load environment variables
dotenv.config({ path: ".env.local" });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
  console.error("Please provide NOTION_API_KEY and NOTION_DATABASE_ID in .env.local");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

// Type mapping based on folder names or frontmatter
const TYPE_MAPPING = {
  "writing": "Writing",
  "books": "Book",
  "projects": "Project",
  "outgoing_links": "Link",
  // Map unexpected types
  "public": "Project", 
  "article": "Writing"
};

function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else if (file.endsWith(".mdx") || file.endsWith(".md")) {
      results.push(filePath);
    }
  });
  return results;
}

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => ({ name: t.trim() }));
  if (typeof tags === 'string') {
    return tags.split(',').map(t => ({ name: t.trim() }));
  }
  return [];
}

// Simple Markdown to Blocks converter
function markdownToBlocks(markdown) {
  const blocks = [];
  const lines = markdown.split('\n');
  let currentListType = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd(); // Keep indentation for lists if we were fancy, but trimming for now
    
    if (!line) continue;

    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: { rich_text: [{ text: { content: line.substring(2) } }] }
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: line.substring(3) } }] }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: [{ text: { content: line.substring(4) } }] }
      });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ text: { content: line.substring(2) } }] }
      });
    } else if (line.match(/^\d+\. /)) {
        const content = line.replace(/^\d+\. /, '');
        blocks.push({
            object: 'block',
            type: 'numbered_list_item',
            numbered_list_item: { rich_text: [{ text: { content: content } }] }
        });
    } else if (line.startsWith('![')) {
        // Image markdown ![alt](url)
        const match = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
            blocks.push({
                object: 'block',
                type: 'image',
                image: { type: 'external', external: { url: match[2] } }
            });
        }
    } else if (line.startsWith('<img') && line.includes('src="')) {
         // HTML Image <img src="...">
         const match = line.match(/src=\"(.*?)\"/);
         if (match) {
             blocks.push({
                 object: 'block',
                 type: 'image',
                 image: { type: 'external', external: { url: match[1] } }
             });
         }
    } else {
      // Default to paragraph
      // Basic check for truncation if too long (Notion limit is 2000 chars per block)
      const content = line.substring(0, 2000);
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content: content } }] }
      });
    }
  }
  return blocks;
}

async function migrate() {
  console.log("🚀 Starting migration to Notion...");
  const contentDir = path.join(process.cwd(), "content");
  const files = getFilesRecursively(contentDir);
  
  console.log(`Found ${files.length} files.`);

  for (const filePath of files) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);
    
    const slug = path.basename(filePath, path.extname(filePath));
    const folderName = path.basename(path.dirname(filePath));
    
    // Determine Type
    let type = "Writing"; // Default
    if (data.type && TYPE_MAPPING[data.type.toLowerCase()]) {
        type = TYPE_MAPPING[data.type.toLowerCase()];
    } else if (TYPE_MAPPING[folderName]) {
        type = TYPE_MAPPING[folderName];
    }

    console.log(`Processing: ${data.title || slug} (${type})`);

    // Check if exists using fetch (fallback since client.databases.query seems flaky here)
    const queryResponse = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: {
          property: "Name",
          title: {
            equals: data.title || slug
          }
        }
      })
    });

    if (!queryResponse.ok) {
        console.error(`  ❌ API Error checking existence: ${queryResponse.status}`);
        continue;
    }

    const existing = await queryResponse.json();

    if (existing.results.length > 0) {
      console.log(`  ⚠️  Skipping (already exists)`);
      continue;
    }

    // Prepare properties
    const properties = {
      "Name": { title: [{ text: { content: data.title || slug } }] },
      "Status": { status: { name: "Done" } },
      "Type": { select: { name: type } },
      "Date": { date: { start: new Date(data.date || new Date()).toISOString().split('T')[0] } },
      "Slug": { rich_text: [{ text: { content: slug } }] },
      "Tags": { multi_select: parseTags(data.tags) },
      "Summary": { rich_text: [{ text: { content: (data.description || "").substring(0, 2000) } }] }
    };

    // Prepare content blocks
    // Notion has a block limit of 100 per request if appending, but create page accepts children.
    // Limit is 100 blocks. If more, we need to append after creation.
    const blocks = markdownToBlocks(content);
    
    const chunks = [];
    for (let i = 0; i < blocks.length; i += 100) {
        chunks.push(blocks.slice(i, i + 100));
    }

    try {
        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_ID },
            properties: properties,
            children: chunks[0] || [] // Create with first 100 blocks
        });
        
        // Append remaining chunks
        if (chunks.length > 1) {
            for (let i = 1; i < chunks.length; i++) {
                await notion.blocks.children.append({
                    block_id: response.id,
                    children: chunks[i]
                });
            }
        }
        
        console.log(`  ✅ Created!`);
    } catch (e) {
        console.error(`  ❌ Failed: ${e.message}`);
        // console.error(JSON.stringify(e.body, null, 2));
    }
  }
  console.log("✨ Migration complete!");
}

migrate();
