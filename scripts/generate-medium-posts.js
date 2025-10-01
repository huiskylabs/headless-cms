#!/usr/bin/env node

/**
 * Generate Medium-friendly markdown versions of all blog posts
 * Converts relative image paths to absolute URLs and removes HTML
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const OUTPUT_DIR = path.join(__dirname, '../content/posts-medium');
const BASE_URL = 'https://peelstudio.ai/blog-images';
const BLOG_BASE_URL = 'https://peelstudio.ai/blog';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Convert relative image paths to absolute URLs
 */
function convertImagePaths(content, postSlug) {
  // Match markdown images: ![alt](./path/to/image.png)
  const imageRegex = /!\[([^\]]*)\]\(\.\/([^)]+)\)/g;

  return content.replace(imageRegex, (match, alt, relativePath) => {
    // Remove post slug from beginning of path if present
    const cleanPath = relativePath.replace(`${postSlug}/`, '');
    const absoluteUrl = `${BASE_URL}/${postSlug}/${cleanPath}`;
    return `![${alt}](${absoluteUrl})`;
  });
}

/**
 * Remove HTML blocks (like divs with inline styles)
 */
function removeHtmlBlocks(content) {
  // Remove opening and closing div tags with everything between
  content = content.replace(/<div[^>]*>[\s\S]*?<\/div>/g, '');

  // Remove self-closing tags and other HTML
  content = content.replace(/<[^>]+>/g, '');

  // Clean up extra blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  return content;
}

/**
 * Add canonical link footer
 */
function addCanonicalFooter(content, postSlug) {
  return content + `\n\n---\n\n*Originally published at [peelstudio.ai/blog](${BLOG_BASE_URL}/${postSlug})*\n`;
}

/**
 * Extract slug from frontmatter
 */
function extractSlug(content) {
  const slugMatch = content.match(/^slug:\s*["']?([^"'\n]+)["']?/m);
  return slugMatch ? slugMatch[1] : null;
}

/**
 * Process a single markdown file
 */
function processMarkdownFile(filePath) {
  const fileName = path.basename(filePath);

  // Skip if already a medium version or not a markdown file
  if (fileName.includes('-medium') || !fileName.endsWith('.md')) {
    return;
  }

  console.log(`Processing: ${fileName}`);

  let content = fs.readFileSync(filePath, 'utf8');

  // Extract slug for URL construction
  const slug = extractSlug(content);
  if (!slug) {
    console.warn(`  ⚠️  No slug found in frontmatter, skipping: ${fileName}`);
    return;
  }

  // Apply transformations
  content = convertImagePaths(content, slug);
  content = removeHtmlBlocks(content);
  content = addCanonicalFooter(content, slug);

  // Write to output directory with same filename
  const outputPath = path.join(OUTPUT_DIR, fileName);
  fs.writeFileSync(outputPath, content, 'utf8');

  console.log(`  ✓ Generated: ${fileName}`);
}

/**
 * Process all markdown files in posts directory
 */
function processAllPosts() {
  console.log('🚀 Generating Medium-friendly posts...\n');

  const files = fs.readdirSync(POSTS_DIR);
  let processed = 0;

  files.forEach(file => {
    const filePath = path.join(POSTS_DIR, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && file.endsWith('.md')) {
      processMarkdownFile(filePath);
      processed++;
    }
  });

  console.log(`\n✅ Done! Processed ${processed} post(s)`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
}

// Run the script
processAllPosts();
