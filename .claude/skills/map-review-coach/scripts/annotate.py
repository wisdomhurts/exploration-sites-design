#!/usr/bin/env python3
"""annotate.py — overlay numbered callout circles on a map image.

Usage:
    python annotate.py <source_image> <callouts.json> [output_image]

callouts.json schema:
    [
      {"n": 1, "x": 0.42, "y": 0.18},
      {"n": 2, "x": 0.78, "y": 0.55}
    ]

x and y are normalized fractions in [0, 1] — (0, 0) is the top-left
corner of the image. Absolute pixel coordinates are also accepted: if
a value is greater than 1, it is treated as pixels.

Output: an annotated PNG (default `<source>_annotated.png` next to the
source) with numbered circles drawn at the given positions. The overlay
is brand-aligned: #1F2A30 fill at 95% alpha, 2px white outer stroke,
white bold numerals inside. Single visual style — severity is conveyed
in the accompanying review markdown, not in the overlay.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print(
        "error: Pillow is required. Install with: pip install Pillow",
        file=sys.stderr,
    )
    sys.exit(1)


FILL = (31, 42, 48, 242)        # #1F2A30 at ~95% alpha
STROKE = (255, 255, 255, 255)
TEXT = (255, 255, 255, 255)
STROKE_WIDTH = 2
SHADOW = (0, 0, 0, 60)
SHADOW_OFFSET = (0, 2)


def resolve_font(size: int) -> ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/seguisb.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "/System/Library/Fonts/SFNSDisplay-Bold.otf",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def annotate(source: Path, callouts: list[dict], output: Path) -> None:
    base = Image.open(source).convert("RGBA")
    width, height = base.size

    circle_diameter = max(24, min(width, height) // 30)
    font_size = int(circle_diameter * 0.55)
    font = resolve_font(font_size)

    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for callout in callouts:
        n = int(callout["n"])
        x_in = float(callout["x"])
        y_in = float(callout["y"])
        x = int(x_in * width) if x_in <= 1 else int(x_in)
        y = int(y_in * height) if y_in <= 1 else int(y_in)

        r = circle_diameter // 2
        sx, sy = SHADOW_OFFSET

        draw.ellipse(
            (x - r + sx, y - r + sy, x + r + sx, y + r + sy),
            fill=SHADOW,
        )
        draw.ellipse(
            (x - r, y - r, x + r, y + r),
            fill=FILL,
            outline=STROKE,
            width=STROKE_WIDTH,
        )

        text = str(n)
        try:
            bbox = draw.textbbox((0, 0), text, font=font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            offset_x = bbox[0]
            offset_y = bbox[1]
        except AttributeError:
            tw, th = draw.textsize(text, font=font)
            offset_x = 0
            offset_y = 0

        draw.text(
            (x - tw // 2 - offset_x, y - th // 2 - offset_y),
            text,
            fill=TEXT,
            font=font,
        )

    combined = Image.alpha_composite(base, overlay)
    combined.convert("RGB").save(output, "PNG", optimize=True)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Overlay numbered callouts on a map image.",
    )
    parser.add_argument("source", type=Path, help="Source map image (PNG/JPG)")
    parser.add_argument("callouts", type=Path, help="JSON file: [{n, x, y}]")
    parser.add_argument(
        "output",
        type=Path,
        nargs="?",
        default=None,
        help="Output PNG (default: <source>_annotated.png)",
    )
    args = parser.parse_args()

    if not args.source.exists():
        print(f"error: source image not found: {args.source}", file=sys.stderr)
        return 2
    if not args.callouts.exists():
        print(f"error: callouts JSON not found: {args.callouts}", file=sys.stderr)
        return 2

    callouts = json.loads(args.callouts.read_text(encoding="utf-8"))
    if not isinstance(callouts, list):
        print("error: callouts JSON must be an array of {n, x, y}", file=sys.stderr)
        return 2

    out = args.output or args.source.with_name(args.source.stem + "_annotated.png")
    annotate(args.source, callouts, out)
    print(str(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
