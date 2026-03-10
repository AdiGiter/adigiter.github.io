#!/usr/bin/env python3
"""
SAHAYAK-DRISHTI — QR Code Bulk Generator
qr_generator.py

Generates print-ready QR code PNG images for all campus locations.
Uses the Python `qrcode` library (pip install qrcode[pil]).

Each QR code encodes:
  http://YOUR_SERVER_IP:8080/index.html?loc=<location_key>

Run:
  pip install qrcode[pil] Pillow
  python qr_generator.py

Output:
  ./qr_output/  — one PNG per location, ready to print
"""

import qrcode
import qrcode.image.svg
import os
import json
from PIL import Image, ImageDraw, ImageFont

# ── CONFIG ────────────────────────────────────────────────
SERVER_URL  = "https://adigiter.github.io" 
OUTPUT_DIR  = "./qr_output"
QR_SIZE_PX  = 300           # QR module size (pixels)
LABEL_H_PX  = 56            # Yellow label strip height
YELLOW      = "#FFD600"
BLACK       = "#000000"
WHITE       = "#FFFFFF"

# ── LOCATIONS ─────────────────────────────────────────────
# Match exactly with the keys in data.sql
LOCATIONS = [
    {"key": "main_entrance",       "label": "Main Entrance"},
    {"key": "library_entry",       "label": "Library Entry"},
    {"key": "library_counter",     "label": "Library Counter"},
    {"key": "admin_block",         "label": "Admin Block"},
    {"key": "scholarship_section", "label": "Scholarship Sec."},
    {"key": "exam_cell",           "label": "Exam Cell"},
    {"key": "canteen",             "label": "Canteen"},
    {"key": "medical_room",        "label": "Medical Room"},
    {"key": "hostel_entry",        "label": "Hostel Entry"},
    {"key": "sports_complex",      "label": "Sports Complex"},
    {"key": "parking_area",        "label": "Parking Area"},
    {"key": "washroom_ground",     "label": "Washroom (GF)"},
    {"key": "atm",                 "label": "Campus ATM"},
    {"key": "principal_office",    "label": "Principal Office"},
]

# ── QR GENERATION ─────────────────────────────────────────
def make_qr(url: str) -> Image.Image:
    """Generate a basic QR code image for the given URL."""
    qr = qrcode.QRCode(
        version=None,                                # Auto-determine size
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High (30%)
        box_size=10,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color=BLACK, back_color=WHITE).convert("RGB")
    return img.resize((QR_SIZE_PX, QR_SIZE_PX), Image.LANCZOS)


def add_label(qr_img: Image.Image, location_key: str, label: str) -> Image.Image:
    """Add a branded yellow label strip below the QR code."""
    total_h = qr_img.height + LABEL_H_PX
    result  = Image.new("RGB", (qr_img.width, total_h), WHITE)
    result.paste(qr_img, (0, 0))

    draw = ImageDraw.Draw(result)

    # Yellow strip
    draw.rectangle([0, qr_img.height, qr_img.width, total_h], fill=YELLOW)

    # Try to load a bold font; fall back to default
    try:
        font_bold  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
    except IOError:
        font_bold  = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Line 1: SAHAYAK-DRISHTI
    line1 = "SAHAYAK-DRISHTI"
    bbox1 = draw.textbbox((0, 0), line1, font=font_bold)
    x1 = (qr_img.width - (bbox1[2] - bbox1[0])) // 2
    draw.text((x1, qr_img.height + 8), line1, fill=BLACK, font=font_bold)

    # Line 2: Location label
    line2 = label.upper()
    bbox2 = draw.textbbox((0, 0), line2, font=font_small)
    x2 = (qr_img.width - (bbox2[2] - bbox2[0])) // 2
    draw.text((x2, qr_img.height + 30), line2, fill=BLACK, font=font_small)

    return result


def generate_all():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    generated = []

    print(f"\n{'='*50}")
    print(f"  SAHAYAK-DRISHTI QR Generator")
    print(f"  Server: {SERVER_URL}")
    print(f"  Output: {OUTPUT_DIR}/")
    print(f"{'='*50}\n")

    for loc in LOCATIONS:
        key   = loc["key"]
        label = loc["label"]
        url   = f"{SERVER_URL}/index.html?loc={key}"

        print(f"  ⬡ Generating: {key}...")
        qr_img     = make_qr(url)
        final_img  = add_label(qr_img, key, label)

        filename = os.path.join(OUTPUT_DIR, f"sahayak-{key}.png")
        final_img.save(filename, format="PNG", dpi=(300, 300))

        generated.append({"key": key, "url": url, "file": filename})
        print(f"    ✓ Saved: {filename}")

    # Save a manifest JSON for reference
    manifest_path = os.path.join(OUTPUT_DIR, "qr_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(generated, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*50}")
    print(f"  ✅ Generated {len(generated)} QR codes → {OUTPUT_DIR}/")
    print(f"  📋 Manifest saved: {manifest_path}")
    print(f"{'='*50}\n")

    print("NEXT STEPS:")
    print("  1. Open qr_output/ folder")
    print("  2. Print each PNG on A4 sticker paper (1 per sheet or tiled)")
    print("  3. Laminate with clear tape")
    print("  4. Stick at eye-level (≈150cm) at each campus location")
    print()


if __name__ == "__main__":
    generate_all()
