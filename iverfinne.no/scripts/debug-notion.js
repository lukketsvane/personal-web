const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

console.log("Client:", notion);
console.log("Databases:", notion.databases);
if (notion.databases) {
    console.log("Query function:", notion.databases.query);
}
