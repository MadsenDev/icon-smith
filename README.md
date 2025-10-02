# IconSmith

IconSmith is a browser-native icon foundry. Drop in an SVG or high-res PNG and instantly generate production-ready asset bundles for Web, Android, iOS, Windows, and desktop. Everything runs client-side—no uploads, no privacy headaches.

## ✨ Highlights

- **Pure client-side pipeline** — Resizing, padding, ICO creation, and zipping all happen in the browser via canvas APIs.
- **Comprehensive presets** — Ships with curated task lists for Web (PWA + favicon), Android (adaptive, foreground, monochrome), iOS (AppIcon + `Contents.json`), Windows (`app.ico`), and Linux/Desktop PNGs.
- **Smart quality hints** — Automatically analyses resolution, aspect ratio, transparency coverage, padding, and source type to surface actionable advice.
- **Live shape overlays** — Preview the artwork against circle, rounded, squircle, or raw canvases to emulate maskable footprints before exporting.
- **Adaptive UI** — Luxury gradient theme, instant drag-and-drop, and real-time padding slider with preview feedback.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Then open the Vite dev server link (usually http://localhost:5173) and drag in an SVG/PNG.

## 🛠️ How It Works

1. **Ingest**
   - Accepts SVG or bitmap inputs via file picker, drag-&-drop, or clipboard (upcoming).
   - Parses dimensions and transparency to compute baseline quality hints.
2. **Render**
   - Resizes the artwork into each preset task using `renderToCanvas` with optional global padding.
   - Generates monochrome variants for Android adaptive icons in-browser.
3. **Package**
   - Builds PNGs, multi-size `favicon.ico`, and `windows/app.ico` without server-side helpers.
   - Bundles extras like Android XML and iOS `Contents.json` in a single ZIP via JSZip + FileSaver.

## 🧪 Quality Hints

- ⚠️ **Resolution warning** when the source is smaller than the largest requested size.
- ✅ **Positive** flag for ample resolution or SVG vector inputs.
- ℹ️ **Aspect ratio and transparency tips** to ensure icons feel centred and maskable.
- Padding feedback reacts live as you adjust the slider.

## 🖼️ Shape Overlays

Use the preview toggles to emulate:

- Circle — Android adaptive / maskable icons.
- Rounded square — Windows / desktop launchers.
- Squircle — iOS home screen appearance.
- None — shows the raw canvas.

## 📦 Output Structure

```
icon-name-icons.zip
├─ web/
│  ├─ icon-192.png
│  ├─ icon-512.png
│  ├─ apple-touch-icon.png
│  ├─ favicon.ico
│  └─ manifest-snippet.json
├─ android/
│  ├─ play_store_512.png
│  ├─ res/mipmap-*/ic_launcher.png
│  ├─ res/mipmap-anydpi-v26/ic_launcher_foreground.png
│  ├─ res/mipmap-anydpi-v26/ic_launcher_monochrome.png
│  └─ res/mipmap-anydpi-v26/ic_launcher.xml
├─ ios/
│  ├─ AppIcon-*.png
│  └─ Contents.json
├─ windows/
│  ├─ ico-*.png
│  └─ app.ico
└─ desktop/
   └─ icon-*.png
```

## 🗺️ Roadmap Ideas

- Per-preset overrides (padding, background fills, selective sizes).
- Batch naming templates & project presets.
- Clipboard paste + URL importing.
- Mac `.icns` generator for macOS packaging.
- Manifest authoring wizard (name, theme, shortcuts) to accompany icon exports.

## 🤝 Contributing

Pull requests are welcome! If you ship a new preset or hint, add a quick blurb to the README and include screenshots in the PR description.

1. Fork & branch: `git checkout -b feature/amazing-idea`
2. Install deps: `npm install`
3. Run dev server: `npm run dev`
4. Add tests or stories if applicable, then open a PR.

## 📄 License

MIT © 2025 IconSmith contributors