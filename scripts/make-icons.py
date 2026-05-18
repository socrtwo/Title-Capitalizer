#!/usr/bin/env python3
"""Generate the PNG icons required by the Office Add-in manifest.

Office requires three primary sizes (16x16, 32x32, 80x80) and a few
auxiliary sizes for high-DPI ribbons. We render a simple "T" mark on a
flat brand-blue background so the icon is recognisable in every Office
ribbon at every supported scale."""

from PIL import Image, ImageDraw, ImageFont
import os

BG = (43, 87, 154, 255)      # Office "Word blue"-ish
FG = (255, 255, 255, 255)
SIZES = [16, 20, 24, 32, 40, 48, 64, 80, 96, 128]

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(OUT_DIR, exist_ok=True)


def find_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)

    # Rounded-rect corners by overlaying transparent corners
    radius = max(2, size // 8)
    mask = Image.new("L", (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    rounded = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rounded.paste(img, (0, 0), mask)

    draw = ImageDraw.Draw(rounded)
    # Render a stylised "T" so the icon reads at small sizes.
    font_size = int(size * 0.72)
    font = find_font(font_size)
    text = "T"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), text, fill=FG, font=font)
    return rounded


def main() -> None:
    for size in SIZES:
        path = os.path.join(OUT_DIR, f"icon-{size}.png")
        draw_icon(size).save(path, "PNG")
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
