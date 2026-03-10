const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function createSamplePost() {
  console.log("🌱 Attempting to seed a sample post into Notion...");
  
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: "My First Notion Post",
              },
            },
          ],
        },
        "Status": {
          status: {
            name: "Done",
          },
        },
        "Date": {
          date: {
            start: new Date().toISOString().split('T')[0],
          },
        },
        "Summary": {
          rich_text: [
            {
              text: {
                content: "This post was automatically created to test the Notion to Web sync.",
              },
            },
          ],
        },
        "Type": {
          select: {
            name: "Skriving",
          },
        },
        "Slug": {
          rich_text: [
            {
              text: {
                content: "my-first-notion-post",
              },
            },
          ],
        },
        "Tags": {
          multi_select: [
            { name: "notion" },
            { name: "test" }
          ]
        }
      },
      children: [
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ text: { content: "Hello from Notion!" } }],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                text: {
                  content: "This content is coming directly from Notion. You can edit it there, run ",
                },
              },
              {
                type: "text",
                text: {
                  content: "npm run sync",
                },
                annotations: {
                  code: true,
                },
              },
              {
                text: {
                  content: ", and it will update on your website.",
                },
              },
            ],
          },
        },
      ],
    });
    console.log("✅ Success! Created page:", response.id);
    console.log("👉 Go to your Notion database and you should see this new entry.");
  } catch (error) {
    console.error("❌ Failed to create post. This usually means the schema doesn't match.");
    console.error("Error details:", error.body || error);
    
    // Fallback: List the schema issues if possible or just advise user
    if (error.code === 'validation_error') {
       console.log("\n⚠️  Likely cause: Your Notion Database doesn't have the columns we expect.");
       console.log("Please ensure your database has these properties:");
       console.log("- Name (Title)");
       console.log("- Status (Status) with option 'Done'");
       console.log("- Date (Date)");
       console.log("- Summary (Text)");
       console.log("- Type (Select) with options: Skriving, Bok, Prosjekt, Lenkje");
       console.log("- Slug (Text)");
       console.log("- Tags (Multi-select)");
    }
  }
}

createSamplePost();
