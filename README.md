Personal web space and knowledge management system.

## Quick Links

- [Projects](https://github.com/lukketsvane/personal-web/tree/main/iverfinne.no/content/projects)
- [Writing](https://github.com/lukketsvane/personal-web/tree/main/iverfinne.no/content/writing)

## Tech Stack

- Next.js
- MDX
- TypeScript
- Tailwind CSS

## Development

```bash
git clone https://github.com/lukketsvane/personal-web.git
cd personal-web
npm install
npm run dev
```

Visit `http://localhost:3000`

## License

MIT © Lukket Svane

## 1. Create a Post
1.  Open your **Notion Database**.
2.  Click **"New"**.
3.  Write your content (Text, Images, Code Blocks).
4.  **Set Status to "Done"**. (Drafts stay hidden)

## 2. Updates
*   **Metadata (Title, Tags, Date):** Updates typically appear within 60 seconds (revalidation time).
*   **Content (Body):** Fetched live when a user expands a post. Always fresh.

## 3. Local Development
Just run the app. It connects to Notion API directly.
```bash
cd iverfinne.no
npm run dev
```

Ensure `.env.local` has `NOTION_API_KEY` and `NOTION_DATABASE_ID`.
