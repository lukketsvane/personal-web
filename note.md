# 🚀 Headless iverfinne.no (Notion Powered)

Your website streams content directly from Notion. No file syncing required.

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
