# IconSmith

IconSmith is a browser-native icon foundry. Drop in an SVG or high-res PNG and instantly generate production-ready asset bundles for Web, Android, iOS, Windows, and desktop. Everything runs client-side—no uploads, no privacy headaches.

## ✨ Highlights

- **Browser-native suite** — Everything runs client-side with React, Vite, Tailwind; no uploads or servers required.
- **Multi-tool dashboard** — Jump between IconSmith, PaletteSmith, FaviconSmith, OGSmith, RenameSmith, ContrastSmith, SpriteSmith, AssetSmith, TokenSmith, MetaSmith, GradientSmith, MarkdownSmith, LocaleSmith, and MockupSmith.
- **Consistent UX** — Unified dark UI, responsive layout, dropdown navigation, and rich previews across tools.
- **Share-ready exports** — Download PNGs, sprites, metadata snippets, OG images, markdown HTML, locale merges, and more.
- **Smart helpers** — Quality hints, palette analysis, renaming rules, diff reports, and color-coded categories.

## 🧰 Available Tools

| Tool | Summary |
| --- | --- |
| IconSmith | Generate platform-specific icon bundles (Android/iOS/Web/Windows/Desktop) + quality hints |
| PaletteSmith | Extract color palettes, output Tailwind config, CSS variables, JSON |
| FaviconSmith | Create multi-size favicons, ICO files, and site.webmanifest |
| OGSmith | Compose Open Graph images with templates, assets, aspect ratios |
| RenameSmith | Batch rename files with casing rules, find/replace, numbering |
| ContrastSmith | Audit colour pairs for WCAG AA/AAA compliance and suggested adjustments |
| SpriteSmith | Build spritesheets with CSS/JSON metadata exports |
| AssetSmith | Compress images in-browser with quality/dimension controls |
| TokenSmith | Convert design tokens between JSON, CSS variables, Tailwind, Style Dictionary |
| MetaSmith | Generate `<head>` metadata snippets (OG, Twitter, theme color) |
| GradientSmith | Craft multi-stop gradients, see previews, export CSS/Tailwind/SVG |
| MarkdownSmith | Live Markdown → HTML previewer with frontmatter display |
| LocaleSmith | Diff/merge localisation JSON, highlight missing/extra keys |
| MockupSmith | Drop assets into browser/device frames and export PNG mockups |
| ShapeSmith | Generate hero blobs, divider waves, stars, and grid patterns with exportable SVG/React |
| ShadowSmith | Craft multi-layer shadows, glassmorphism panels, and neon glows |
| NoiseSmith | Generate subtle grain, dust, and scan-line overlays with exports |
| RegexSmith | Test patterns, capture groups, replacements, and explanations |
| DiffSmith | View split/unified diffs for text or JSON with change summaries |
| DataSmith | Generate fake datasets with seeds, presets, and JSON/CSV exports |

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