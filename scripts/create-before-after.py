#!/usr/bin/env python3

"""
Create a side-by-side before/after comparison image
"""

from PIL import Image, ImageDraw, ImageFont
import sys
import os

def create_side_by_side(before_path, after_path, output_path, gap=40):
    """
    Create a side-by-side comparison image with labels

    Args:
        before_path: Path to the 'before' image
        after_path: Path to the 'after' image
        output_path: Path to save the combined image
        gap: Spacing between images in pixels
    """
    # Load images
    before_img = Image.open(before_path)
    after_img = Image.open(after_path)

    # Resize images to same height if needed
    if before_img.height != after_img.height:
        target_height = min(before_img.height, after_img.height)

        if before_img.height > target_height:
            aspect = before_img.width / before_img.height
            before_img = before_img.resize((int(target_height * aspect), target_height), Image.Resampling.LANCZOS)

        if after_img.height > target_height:
            aspect = after_img.width / after_img.height
            after_img = after_img.resize((int(target_height * aspect), target_height), Image.Resampling.LANCZOS)

    # Calculate dimensions
    total_width = before_img.width + after_img.width + gap
    total_height = before_img.height + 80  # Extra space for labels

    # Create new image with white background
    combined = Image.new('RGB', (total_width, total_height), 'white')

    # Paste images
    combined.paste(before_img, (0, 40))
    combined.paste(after_img, (before_img.width + gap, 40))

    # Add labels
    draw = ImageDraw.Draw(combined)

    # Try to use a nice font, fall back to default if not available
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
        except:
            font = ImageFont.load_default()
            font_small = font

    # Draw labels
    draw.text((before_img.width // 2, 15), "BEFORE", fill='black', anchor='mm', font=font)
    draw.text((before_img.width + gap + after_img.width // 2, 15), "AFTER", fill='black', anchor='mm', font=font)

    # Add subtle separator line
    separator_x = before_img.width + gap // 2
    draw.line([(separator_x, 40), (separator_x, total_height - 40)], fill='#cccccc', width=2)

    # Save
    combined.save(output_path, quality=95, optimize=True)
    print(f"✓ Created side-by-side image: {output_path}")
    print(f"  Dimensions: {total_width}x{total_height}")

if __name__ == "__main__":
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    images_dir = os.path.join(project_root, "content/posts/ai-image-generation-lottery-tickets")

    before_path = os.path.join(images_dir, "before.png")
    after_path = os.path.join(images_dir, "after.png")
    output_path = os.path.join(images_dir, "before-after-comparison.png")

    if not os.path.exists(before_path):
        print(f"Error: Before image not found: {before_path}")
        sys.exit(1)

    if not os.path.exists(after_path):
        print(f"Error: After image not found: {after_path}")
        sys.exit(1)

    create_side_by_side(before_path, after_path, output_path)
