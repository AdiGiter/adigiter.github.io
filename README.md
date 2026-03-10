# Sahayak-Drishti 👁
### A "No-App" Audio Guidance System for Public Spaces
**Team Innovix | BIT Mesra, Off Campus Jaipur | NSS IDP SP-2026**

🔗 **Live Site:** https://adigiter.github.io

---

## What It Does

Sahayak-Drishti is a fully static Progressive Web App (PWA) that turns any phone camera into an audio guide for visually impaired and illiterate users.

A network of QR code stickers is placed at key campus locations (entrance, library, canteen, hostel, etc.). When a user scans a sticker, their browser opens a page that **automatically speaks the location description** in Hindi or English — no app download required.

A separate **navigation page** lets users find the shortest walking route between any two campus locations, with step-by-step spoken directions in both languages.

---

## How It Works

```
[QR Sticker at Campus Location]
         ↓  user scans
[Phone Camera → Opens Browser]
         ↓
[index.html?loc=library_entry]
         ↓
[app.js fetches locations.json]
         ↓
[Web Speech API (SpeechSynthesis)]
         ↓
🔊 "You are at the Main Library entrance..."
```

For navigation:
```
[User picks From → To on navigate.html]
         ↓
[Dijkstra shortest path on campus graph]
         ↓
[Turn-by-turn directions built]
         ↓
🔊 "Step 1: Turn right, 40 steps to Admin Block..."
```

---

## Project Structure

```
adigiter.github.io/
├── index.html          ← QR scan landing page (audio guidance)
├── navigate.html       ← Campus navigation with Dijkstra pathfinding
├── admin.html          ← Admin panel UI (frontend only)
├── app.js              ← Speech API + location fetch logic
├── style.css           ← Guide page styles
├── admin.css           ← Admin panel styles
├── admin.js            ← Admin panel JavaScript
├── locations.json      ← All 14 campus locations (bilingual data)
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (offline caching)
├── qr_generator.py     ← Python script to generate QR code PNGs
└── qr-codes/           ← Pre-generated QR code images
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Hosting | GitHub Pages (free, static) |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Speech | Web Speech API (SpeechSynthesis) — browser-native, no cloud |
| Navigation | Dijkstra shortest path (plain JS, ~30 lines) |
| Data | Static `locations.json` (14 locations, EN + HI) |
| PWA | Service Worker + Cache API (works offline after first load) |
| QR Generation | Python `qrcode` library |

No backend. No database. No server costs.

---

## Campus Locations (14)

| Key | Location |
|---|---|
| `main_entrance` | Main Entrance |
| `admin_block` | Administrative Block |
| `principal_office` | Principal Office |
| `scholarship_section` | Scholarship Section |
| `exam_cell` | Examination Cell |
| `library_entry` | Main Library — Entry |
| `library_counter` | Library — Issue & Return Counter |
| `medical_room` | Campus Medical Room |
| `atm` | Campus ATM |
| `sports_complex` | Sports Complex / Ground |
| `canteen` | Campus Canteen |
| `hostel_entry` | Hostel Entry Gate |
| `washroom_ground` | Ground Floor Washroom — Admin Block |
| `parking_area` | Campus Parking |

---

## Test URLs

| URL | Description |
|---|---|
| https://adigiter.github.io | Home page |
| https://adigiter.github.io/index.html?loc=library_entry | Library QR scan demo |
| https://adigiter.github.io/index.html?loc=main_entrance | Main entrance demo |
| https://adigiter.github.io/navigate.html | Campus navigation |

---

## Generating QR Codes

```bash
pip install qrcode[pil] Pillow
python qr_generator.py
# Output: ./qr_output/ — one PNG per location
```

QR codes encode URLs in the format:
```
https://adigiter.github.io/index.html?loc=<location_key>
```

Print on A4 sticker paper, laminate, and mount at eye level (~150cm) at each location.

---

## Features

- **Zero Install** — works in any mobile browser, no app download
- **Bilingual** — English and Hindi, auto-detected from phone language
- **Offline PWA** — service worker caches the site after first load
- **Campus Navigation** — Dijkstra shortest path between all 14 locations with spoken turn-by-turn directions
- **Accessible UI** — high contrast, large buttons, screen reader compatible
- **Speed Control** — 0.7×, 1.0×, 1.3×, 1.6× speech rate
- **Free to run** — GitHub Pages hosting, browser-native speech, no API costs

---

## Cost

| Item | Cost |
|---|---|
| Hosting | ₹0 (GitHub Pages) |
| Speech API | ₹0 (browser-native) |
| QR Generation | ₹0 (Python library) |
| Printing + Lamination | ₹200–400 |
| **Total** | **₹200–400** |

---

## Social Impact

- Aligns with **Accessible India Campaign (Sugamya Bharat Abhiyan)**
- Serves both visually impaired (audio) and illiterate users (audio)
- Replicable in hospitals, bus stands, government offices
- Cheaper than Braille signage or digital kiosks

---

*Sahayak-Drishti — Empowering independent navigation for all.*
