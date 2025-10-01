#!/bin/bash

# Create before/after comparison image for a blog post
# Usage: ./scripts/create-comparison.sh [post-slug]

POST_SLUG=${1:-"ai-image-generation-lottery-tickets"}
POST_DIR="content/posts/${POST_SLUG}"

if [ ! -d "$POST_DIR" ]; then
    echo "Error: Post directory not found: $POST_DIR"
    exit 1
fi

BEFORE="$POST_DIR/before.png"
AFTER="$POST_DIR/after.png"
OUTPUT="$POST_DIR/before-after-comparison.png"

if [ ! -f "$BEFORE" ]; then
    echo "Error: Before image not found: $BEFORE"
    exit 1
fi

if [ ! -f "$AFTER" ]; then
    echo "Error: After image not found: $AFTER"
    exit 1
fi

echo "Creating side-by-side comparison..."

magick "$BEFORE" "$AFTER" \
    -resize x800 \
    +append \
    -bordercolor white \
    -border 20x60 \
    -gravity North \
    -pointsize 32 \
    -font Helvetica-Bold \
    -fill black \
    -annotate +0+20 "BEFORE                                                   AFTER" \
    -quality 85 \
    -strip \
    "$OUTPUT"

if [ $? -eq 0 ]; then
    echo "✓ Created: $OUTPUT"
    ls -lh "$OUTPUT"
else
    echo "✗ Failed to create comparison image"
    exit 1
fi
