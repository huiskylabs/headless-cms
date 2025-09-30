# Git-Based Headless CMS

A simple, version-controlled blog content system using Markdown files and GitHub.

## Architecture

- **Content**: Markdown files in `/content/posts/`
- **Version Control**: Git/GitHub for content management
- **Local Editing**: VS Code, Obsidian, or any text editor
- **Deployment**: Your website (Next.js, Astro, etc.) reads from this repo
- **Rendering**: SSR, SSG, or ISR - your choice

## Directory Structure

```
content/
├── posts/          # Published blog posts
│   └── welcome.md
└── drafts/         # Work in progress (not committed)
```

## Writing Posts

### 1. Create a New Post

Create a new `.md` file in `content/posts/`:

```bash
touch content/posts/my-new-post.md
```

### 2. Add Frontmatter

Every post needs frontmatter at the top:

```markdown
---
title: "Your Post Title"
slug: "your-post-title"
date: "2025-09-30"
author: "Your Name"
excerpt: "Brief description for previews"
tags: ["tag1", "tag2"]
published: true
---

# Your Content Here

Write your blog post in Markdown...
```

### 3. Write Content

Use standard Markdown syntax:
- Headers (`#`, `##`, `###`)
- Lists (`-`, `1.`)
- Links (`[text](url)`)
- Images (`![alt](url)`)
- Code blocks (` ``` `)

### 4. Commit and Push

```bash
git add content/posts/my-new-post.md
git commit -m "Add new blog post: My New Post"
git push origin main
```

Your website will automatically rebuild (if using Vercel/Netlify).

## Website Integration

### Next.js App Router (SSR)

```javascript
// app/blog/[slug]/page.js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export default async function BlogPost({ params }) {
  const filePath = path.join(process.cwd(), 'content/posts', `${params.slug}.md`)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)

  return (
    <article>
      <h1>{data.title}</h1>
      <time>{data.date}</time>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  )
}
```

### Next.js with ISR (Incremental Static Regeneration)

```javascript
export const revalidate = 60 // Revalidate every 60 seconds

export default async function BlogPost({ params }) {
  // Same as above - but with automatic revalidation
}
```

### Fetching from GitHub API (SSR without cloning repo)

```javascript
export default async function BlogPost({ params }) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/content/posts/${params.slug}.md`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3.raw'
      }
    }
  )
  const content = await response.text()
  const { data, content: markdown } = matter(content)

  return <Article data={data} content={markdown} />
}
```

## Local Editing Tools

### Option 1: VS Code
- Install Markdown extensions
- Use built-in Git integration
- Preview with `Ctrl+Shift+V`

### Option 2: Obsidian
- Open this folder as an Obsidian vault
- Rich Markdown editing experience
- Link between posts easily

### Option 3: Typora / MarkText
- WYSIWYG Markdown editors
- Clean writing interface

## Workflow

1. **Draft**: Write in `content/drafts/` (gitignored by default)
2. **Edit**: Move to `content/posts/` when ready
3. **Publish**: Commit and push to GitHub
4. **Deploy**: Website auto-rebuilds (Vercel/Netlify)

## Dependencies for Your Website

Install these in your Next.js/Astro project:

```bash
npm install gray-matter markdown-it
# or
npm install @next/mdx
```

## Advantages

- ✅ Version control - full history of changes
- ✅ No database needed
- ✅ Write offline
- ✅ Free hosting (GitHub)
- ✅ SSR/SSG/ISR compatible
- ✅ Perfect for SEO
- ✅ Portable - works with any framework
- ✅ Simple backup (just git)

## Tips

- Keep images in `content/posts/images/` or use external hosting (Cloudinary, etc.)
- Use consistent frontmatter fields across all posts
- Create a `content/posts/template.md` for new post scaffolding
- Use GitHub Actions to validate frontmatter on commits
