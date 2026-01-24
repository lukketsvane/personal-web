// Notion API client library
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { Post } from "@/types/post";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

const TYPE_MAPPING: Record<string, "writing" | "books" | "projects" | "outgoing_links"> = {
  "Writing": "writing",
  "Book": "books",
  "Project": "projects",
  "Link": "outgoing_links"
};

function getDatabaseId() {
    let dbId = process.env.NOTION_DATABASE_ID;
    if (!dbId) {
        throw new Error("Missing NOTION_DATABASE_ID");
    }
    // Add dashes if missing
    if (!dbId.includes('-')) {
        dbId = dbId.replace(
            /^([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})$/,
            '$1-$2-$3-$4-$5'
        );
    }
    return dbId;
}

// Helper to extract properties safely
function getPageProperties(page: any) {
  const props = page.properties || {};

  const findProp = (name: string) => {
    const key = Object.keys(props).find(k => k.toLowerCase() === name.toLowerCase());
    return key ? props[key] : null;
  };

  const getRichText = (name: string) => {
    const prop = findProp(name);
    if (!prop || !prop.rich_text || !Array.isArray(prop.rich_text)) return "";
    return prop.rich_text[0]?.plain_text || "";
  };

  const getTitle = () => {
    const titleKey = Object.keys(props).find(key => props[key] && props[key].type === 'title');
    if (!titleKey || !props[titleKey].title || !Array.isArray(props[titleKey].title)) return "Untitled";
    return props[titleKey].title[0]?.plain_text || "Untitled";
  };

  const getSelect = (name: string) => {
    const prop = findProp(name);
    return prop?.select?.name || prop?.status?.name; // Fallback to status name if it's a status property
  };

  const getDate = (name: string) => {
    const prop = findProp(name);
    return prop?.date?.start;
  };

  const getMultiSelect = (name: string) => {
    const prop = findProp(name);
    if (!prop || !prop.multi_select || !Array.isArray(prop.multi_select)) return [];
    return prop.multi_select.map((t: any) => t.name) || [];
  };

  const getUrl = (name: string) => {
    const prop = findProp(name);
    return prop?.url || "";
  };

  const title = getTitle();
  let slug = getRichText("Slug");
  if (!slug) {
     slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  
  const date = getDate("Date") || page.created_time.split('T')[0];
  const description = getRichText("Summary") || getRichText("Description") || "";
  
  let typeRaw = getSelect("Type") || "Writing";
  const type = TYPE_MAPPING[typeRaw] || "writing";

  const tags = getMultiSelect("Tags");
  const url = getUrl("URL") || getUrl("Link") || "";
  
  let image: string | undefined = undefined;
  if (page.cover) {
    if (page.cover.type === "external") {
      image = page.cover.external.url;
    } else if (page.cover.type === "file") {
      image = page.cover.file.url;
    }
  }

  let icon: string | undefined = undefined;
  if (page.icon) {
    if (page.icon.type === "external") {
      icon = page.icon.external.url;
    } else if (page.icon.type === "file") {
      icon = page.icon.file.url;
    } else if (page.icon.type === "emoji") {
      icon = page.icon.emoji;
    }
  }

  // Construct a unique ID
  const uid = `${type}-${slug}`;

  return {
    uid,
    id: page.id,
    title,
    slug,
    date,
    description,
    type,
    tags,
    image,
    url,
    icon
  };
}

export async function getPublishedPosts(): Promise<Post[]> {
  const databaseId = getDatabaseId();
  console.log(`Querying Notion database: ${databaseId}`);
  
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Status",
        status: {
          equals: "Done"
        }
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    console.log(`Notion returned ${response.results.length} results`);

    const posts = response.results
      .map((page): Post | null => {
        try {
          const props = getPageProperties(page);
          return {
            ...props,
            content: "", 
            thumbnails: props.image ? [{ src: props.image, alt: props.title }] : [],
          };
        } catch (e) {
          console.error(`Error processing Notion page ${page.id}:`, e);
          return null;
        }
      })
      .filter((post): post is Post => post !== null);

    return posts;
  } catch (error: any) {
    console.error("Notion API error:", error);
    throw error;
  }
}

export async function getPostContent(pageId: string): Promise<string> {
  const mdblocks = await n2m.pageToMarkdown(pageId);
  const mdObject = n2m.toMarkdownString(mdblocks);
  return mdObject.parent || "";
}

export async function getPostIdBySlug(slug: string): Promise<string | null> {
    const databaseId = getDatabaseId();
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                { property: "Status", status: { equals: "Done" } },
                { property: "Slug", rich_text: { equals: slug } } 
            ]
        }
    });

    if (response.results.length > 0) {
        return response.results[0].id;
    }
    return null;
}