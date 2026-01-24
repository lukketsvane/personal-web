const { Client } = require("@notionhq/client");
const notion = new Client({ auth: "secret_123" });
console.log(Object.keys(notion));
console.log(notion.databases ? "databases exists" : "no databases");
if (notion.databases) console.log(Object.keys(notion.databases));
