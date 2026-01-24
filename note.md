# 🚀 How to Manage iverfinne.no via Notion

Your website is now a "headless" blog powered by Notion. You write; the robots do the rest.

## 1. Create a Post
1.  Open your **Notion Database**.
2.  Click **"New"**.
3.  Write your content (Text, Images, Code Blocks).
4.  **Set Status to "Done"**. (This is the trigger!)

## 2. Required Properties
For a post to appear, ensure these columns are filled:
| Property | Value |
| :--- | :--- |
| **Name** | Title of your post |
| **Status** | `Done` (Drafts stay hidden) |
| **Type** | `Writing`, `Project`, `Book`, or `Link` |
| **Date** | Publication date |

## 3. The Automation (How it works)
*   **Automatic:** Every **hour**, GitHub checks your Notion for "Done" posts.
*   **Magic:** It downloads your text & images, commits them to code, and updates the site.
*   **Manual Override:** Want it live *now*?
    *   Go to [GitHub Actions](https://github.com/lukketsvane/personal-web/actions) -> **Sync Notion Content** -> **Run Workflow**.

## 5. Instant Updates (Webhook)
To trigger the sync immediately from an external tool (like Make, Zapier, or a script), send a POST request to the GitHub API:

**URL:** `https://api.github.com/repos/lukketsvane/personal-web/dispatches`

**Headers:**
*   `Accept: application/vnd.github.v3+json`
*   `Authorization: token YOUR_GITHUB_PAT` (Must have `repo` scope)
*   `User-Agent: YourApp`

**Body:**
```json
{
  "event_type": "notion_update"
}
```

## 4. Local Development (Optional)
If you are coding on your laptop and want to pull the latest Notion posts to test:
```bash
cd iverfinne.no
npm run sync
npm run dev
```
