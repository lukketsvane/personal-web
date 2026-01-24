import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { Post } from "@/types/post";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

console.log("Notion Client initialized. Query method exists:", typeof notion.databases?.query);

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
    return prop?.rich_text?.[0]?.plain_text || "";
  };

  const getTitle = () => {
    const titleKey = Object.keys(props).find(key => props[key].type === 'title');
    return titleKey ? props[titleKey].title?.[0]?.plain_text : "Untitled";
  };

  const getSelect = (name: string) => findProp(name)?.select?.name;
  const getDate = (name: string) => findProp(name)?.date?.start;
  const getMultiSelect = (name: string) => findProp(name)?.multi_select?.map((t: any) => t.name) || [];

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
  
  let image = null;
  if (page.cover) {
    if (page.cover.type === "external") {
      image = page.cover.external.url;
    } else if (page.cover.type === "file") {
      image = page.cover.file.url;
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
  };
}

export async function getPublishedPosts(): Promise<Post[]> {
  const databaseId = getDatabaseId();
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

  const posts = response.results.map((page) => {
    const props = getPageProperties(page);
    
    return {
      ...props,
      content: "", // We don't load content in the list view for performance
      thumbnails: props.image ? [{ src: props.image, alt: props.title }] : [],
    };
  });

  return posts as Post[];
}

export async function getPostContent(pageId: string): Promise<string> {
  const mdblocks = await n2m.pageToMarkdown(pageId);
  const mdObject = n2m.toMarkdownString(mdblocks);
  return mdObject.parent || "";
}

export async function getPostIdBySlug(slug: string): Promise<string | null> {
    // This is a bit inefficient if we don't have the ID, but needed if we only have slug
    // For this app, we might pass the Notion ID to the frontend to make this faster
    const databaseId = getDatabaseId();
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                { property: "Status", status: { equals: "Done" } },
                { property: "Slug", rich_text: { equals: slug } } // Fallback if exact match
            ]
        }
    });

    if (response.results.length > 0) {
        return response.results[0].id;
    }
    return null;
}
