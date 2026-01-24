# Notion Database Configuration

To sync your Notion database with iverfinne.no, your database MUST have these exact properties.

### Required Properties
| Property Name | Type | Notes |
| :--- | :--- | :--- |
| **Name** | Title | This is the default "Title" column. |
| **Status** | Status | Ensure it has a status named "Done". |
| **Type** | Select | Options: `Writing`, `Book`, `Project`, `Link` |
| **Date** | Date | |
| **Summary** | Text (Rich Text) | |
| **Slug** | Text (Rich Text) | Used for the URL (e.g., `my-cool-post`). |
| **Tags** | Multi-select | |

### How to add them in Notion:
1. Open your Database in Notion.
2. Click the **"+"** icon on the far right of the table headers.
3. Search for the **Type** (e.g., Select, Date, Status).
4. Rename the property to match the **Property Name** above exactly (Case-sensitive).

---

### Syncing
Once the columns are added, you can run the sync locally:
```bash
npm run sync
```
This will download all pages where **Status** is "Done" into the `content/` folder.
