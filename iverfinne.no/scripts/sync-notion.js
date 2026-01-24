const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");
const https = require("https");
const dotenv = require("dotenv");
const matter = require("gray-matter");
const crypto = require("crypto");

// Load environment variables
dotenv.config({ path: ".env.local" });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
let NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
  console.error("Please provide NOTION_API_KEY and NOTION_DATABASE_ID in .env.local");
  process.exit(1);
}

// Format Database ID if it's missing dashes
if (!NOTION_DATABASE_ID.includes('-')) {
    NOTION_DATABASE_ID = NOTION_DATABASE_ID.replace(
        /^([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})$/,
        '$1-$2-$3-$4-$5'
    );
}

const notion = new Client({ auth: NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

const TYPE_MAPPING = {
  "Writing": "writing",
  "Book": "books",
  "Project": "projects",
  "Link": "outgoing_links"
};

// Helper to download image
async function downloadImage(url, filename) {
    const publicDir = path.join(process.cwd(), "public", "images", "notion");
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const filepath = path.join(publicDir, filename);
    
    // Check if file already exists (optimization: could check hash/size, but simple existence is fast)
    if (fs.existsSync(filepath)) {
        return `/images/notion/${filename}`;
    }

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(`/images/notion/${filename}`);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

// Helper to process markdown and download images
async function processImagesInMarkdown(mdContent, slug) {
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let newContent = mdContent;
    let match;

    // Use a loop to find all matches
    const matches = [...mdContent.matchAll(imageRegex)];

    for (const m of matches) {
        const alt = m[1];
        const url = m[2];

        // Only process Notion URLs (aws amazon)
        if (url.includes("amazonaws.com") && url.includes("secure.notion-static.com")) {
            try {
                // Create a unique filename based on the URL hash or slug + index
                const ext = path.extname(url.split('?')[0]) || ".jpg";
                const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
                const filename = `${slug}-${hash}${ext}`;
                
                console.log(`    ⬇️  Downloading image: ${filename}`);
                const localUrl = await downloadImage(url, filename);
                
                // Replace in content
                newContent = newContent.replace(url, localUrl);
            } catch (e) {
                console.error(`    ⚠️  Failed to download image in ${slug}: ${e.message}`);
            }
        }
    }
    return newContent;
}

async function getPageProperties(page) {
  const props = page.properties || {}; 
  
  const findProp = (name) => {
    const key = Object.keys(props).find(k => k.toLowerCase() === name.toLowerCase());
    return key ? props[key] : null;
  };

  const getRichText = (name) => {
    const prop = findProp(name);
    return prop?.rich_text?.[0]?.plain_text || "";
  };

  const getTitle = () => {
    const titleKey = Object.keys(props).find(key => props[key].type === 'title');
    return titleKey ? props[titleKey].title?.[0]?.plain_text : "Untitled";
  };

  const getSelect = (name) => findProp(name)?.select?.name;
  const getDate = (name) => findProp(name)?.date?.start;
  const getMultiSelect = (name) => findProp(name)?.multi_select?.map(t => t.name) || [];
  
  // Status check is done in query now, but good to keep as fallback
  const getStatus = (name) => findProp(name)?.status?.name;

  const title = getTitle();
  let slug = getRichText("Slug");
  if (!slug) {
     slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  
  const date = getDate("Date") || page.created_time.split('T')[0];
  const description = getRichText("Summary") || getRichText("Description") || "";
  
  let type = getSelect("Type") || "Writing";
  const mappedType = TYPE_MAPPING[type] || type.toLowerCase();

  const tags = getMultiSelect("Tags");
  
  let image = null;
  if (page.cover) {
    if (page.cover.type === "external") {
      image = page.cover.external.url;
    } else if (page.cover.type === "file") {
      image = page.cover.file.url;
    }
  }

  return {
    title,
    slug,
    date,
    description,
    type: mappedType,
    tags,
    image,
    id: page.id,
    lastModified: page.last_edited_time
  };
}

async function syncNotion() {
  console.log("🔄 Syncing from Notion...");
  console.log(`Target Database ID: ${NOTION_DATABASE_ID}`);

  try {
    // Filter for Status = "Done"
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: {
          property: "Status",
          status: {
            equals: "Done"
          }
        }
      })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error(`❌ Notion API Error (${response.status}):`, err);
        return;
    }

    const data = await response.json();
    const pages = data.results;
    console.log(`Found ${pages.length} published pages.`);

    if (pages.length === 0) {
      console.log("⚠️  No pages found with Status='Done'.");
      return;
    }

    const validFiles = new Set();

    for (const page of pages) {
      const props = await getPageProperties(page);
      const targetDir = ["writing", "books", "projects", "outgoing_links"].includes(props.type) ? props.type : "writing";
      const outputDir = path.join(process.cwd(), "content", targetDir);
      const filePath = path.join(outputDir, `${props.slug}.mdx`);
      
      // Check for incremental sync
      let skip = false;
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, "utf8");
          const existingMatter = matter(fileContent);
          if (existingMatter.data.lastModified === props.lastModified) {
             skip = true;
          }
        } catch (e) {
          // If error reading, just re-sync
        }
      }

      validFiles.add(filePath);

      if (skip) {
        // console.log(`    ⏭️  Skipping unchanged: ${props.title}`); 
        continue;
      }

      console.log(`Processing: ${props.title} -> content/${props.type}/${props.slug}.mdx`);

      // 1. Convert Body to Markdown
      const mdblocks = await n2m.pageToMarkdown(page.id);
      const mdObject = n2m.toMarkdownString(mdblocks);
      let mdString = mdObject.parent || "";

      // 2. Process Body Images (Download & Rewrite)
      mdString = await processImagesInMarkdown(mdString, props.slug);

      // 3. Process Cover Image
      let coverImage = props.image;
      if (coverImage && coverImage.includes("amazonaws.com")) {
           try {
               const ext = path.extname(coverImage.split('?')[0]) || ".jpg";
               const filename = `${props.slug}-cover${ext}`;
               console.log(`    ⬇️  Downloading cover: ${filename}`);
               coverImage = await downloadImage(coverImage, filename);
           } catch (e) {
               console.error(`    ⚠️  Failed cover download: ${e.message}`);
           }
      }

      // 4. Construct Frontmatter
      const frontmatter = {
        title: props.title,
        description: props.description,
        date: props.date,
        tags: props.tags,
        type: ["writing", "books", "projects", "outgoing_links"].includes(props.type) ? props.type : "writing",
        lastModified: props.lastModified,
      };

      if (coverImage) {
        frontmatter.image = coverImage;
        frontmatter.thumbnails = [{ src: coverImage, alt: props.title }];
      }

      const fileContent = matter.stringify(mdString, frontmatter);
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(filePath, fileContent);
    }

    // 5. Cleanup: Delete files not in Notion
    console.log("🧹 Cleaning up old files...");
    const contentDirs = ["writing", "books", "projects", "outgoing_links"];
    for (const dir of contentDirs) {
      const dirPath = path.join(process.cwd(), "content", dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const fullPath = path.join(dirPath, file);
          if (!validFiles.has(fullPath) && file.endsWith(".mdx")) {
            console.log(`    🗑️  Deleting orphaned file: ${dir}/${file}`);
            fs.unlinkSync(fullPath);
          }
        }
      }
    }

    console.log("✨ Sync complete!");

  } catch (error) {
    console.error("Error syncing with Notion:", error);
    process.exit(1);
  }
}

syncNotion();