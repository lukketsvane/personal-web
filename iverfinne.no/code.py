import os
output_file = "combined.txt"

def collect_manual_tsx_ts_contents(file_paths, output_path):
    with open(output_path, "w") as outfile:
        for file_path in file_paths:
            if os.path.exists(file_path) and (file_path.endswith(".tsx") or file_path.endswith(".ts")):
                outfile.write(f"### File Location: {file_path} ###\n\n")
                with open(file_path, "r") as ts_file:
                    outfile.write(ts_file.read())
                outfile.write("\n\n---\n\n")
            else:
                print(f"Invalid or missing file: {file_path}")

file_paths = [
    "/workspaces/personal-web/iverfinne.no/app/api/posts/route.ts",
    "/workspaces/personal-web/iverfinne.no/app/layout.tsx",
    "/workspaces/personal-web/iverfinne.no/app/page.tsx",
    "/workspaces/personal-web/iverfinne.no/components/WebDesignKeys.tsx",
    "/workspaces/personal-web/iverfinne.no/components/markdown-renderer.tsx",
    "/workspaces/personal-web/iverfinne.no/components/mdx-blog-wrapper.tsx",
    "/workspaces/personal-web/iverfinne.no/components/mdx-blog.tsx",
    "/workspaces/personal-web/iverfinne.no/components/outgoing-link.tsx",
    "/workspaces/personal-web/iverfinne.no/components/sphere-viewer.tsx",
    "/workspaces/personal-web/iverfinne.no/components/ui/badge.tsx",
    "/workspaces/personal-web/iverfinne.no/components/ui/button.tsx",
    "/workspaces/personal-web/iverfinne.no/components/ui/card.tsx",
    "/workspaces/personal-web/iverfinne.no/components/ui/input.tsx",
    "/workspaces/personal-web/iverfinne.no/lib/mdx-utils.ts",
    "/workspaces/personal-web/iverfinne.no/tailwind.config.ts"
]

collect_manual_tsx_ts_contents(file_paths, output_file)
print(f"Selected TS and TSX file contents have been written to {output_file}")
