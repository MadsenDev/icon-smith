# Smith Suite

Smith Suite is a collection of browser-native design and development tools. Each app runs fully client-side with React, Vite, and Tailwind—no servers, no uploads, just rapid iteration in your browser. The suite continues to grow, spanning colour, imagery, metadata, accessibility, content, and developer productivity workflows.

## ✨ Highlights

- **Browser-native suite** — All tooling runs client-side; React + Vite + Tailwind power the entire experience.
- **Launchpad dashboard** — Category-sorted cards and quick nav keep 20+ tools discoverable as the suite grows.
- **Consistent UX** — Shared visual language, responsive layouts, and cohesive interaction patterns across every Smith.
- **Export everything** — Grab PNGs, sprites, metadata snippets, OG images, markdown HTML, locale merges, diffs, datasets, and more.
- **Helpful guidance** — Intelligent hints for colour contrast, tokens, regex flags, dataset configs, and icon quality.

## 🧰 Tools at a Glance

| Tool | Summary |
| --- | --- |
| IconSmith | Generate platform-specific icon bundles (Android/iOS/Web/Windows/Desktop) + quality hints |
| PaletteSmith | Extract colour palettes, output Tailwind config, CSS variables, JSON |
| FaviconSmith | Create multi-size favicons, ICO files, and `site.webmanifest` |
| OGSmith | Compose Open Graph images with templates, assets, aspect ratios |
| RenameSmith | Batch rename files with casing rules, find/replace, numbering |
| ContrastSmith | Audit colour pairs for WCAG AA/AAA compliance and suggested adjustments |
| SpriteSmith | Build spritesheets with CSS/JSON metadata exports |
| AssetSmith | Compress images in-browser with quality/dimension controls |
| TokenSmith | Convert design tokens between JSON, CSS variables, Tailwind, Style Dictionary |
| MetaSmith | Generate `<head>` metadata snippets (OG, Twitter, theme colour) |
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

Open the Vite URL (defaults to http://localhost:5173) and explore the dashboard. Every tool works offline once loaded.

## 🧩 Tool Categories

- **Design & Visuals** — IconSmith, PaletteSmith, ShapeSmith, GradientSmith, ShadowSmith, NoiseSmith, MockupSmith
- **Assets & Metadata** — FaviconSmith, AssetSmith, SpriteSmith, MetaSmith
- **Content & Docs** — OGSmith, MarkdownSmith, LocaleSmith
- **Productivity** — RenameSmith, TokenSmith, DiffSmith, DataSmith, RegexSmith
- **Accessibility** — ContrastSmith

## 🔍 Under the Hood

- **Client-side rendering** via Canvas, `html2canvas`, and tailored generators for sprites, noise, gradients, and SVG shapes.
- **Data utilities** including design token parsing, regex helpers, seeded dataset generation, CSV/JSON exporters, and contrast math.
- **Shared UI** with Tailwind CSS, responsive cards, and a persistent nav that scales as new Smith tools arrive.
- **Bundling** with Vite for instant HMR, TypeScript types, and zero-config performance.

## 🗺️ Roadmap Ideas

- Tool categories & search across the dashboard
- Workspace presets for favourite Smith combinations
- Clipboard paste, URL importing, and drag-drop everywhere
- Additional export pipelines (macOS `.icns`, token formats, Storybook docs)
- Collaboration features for sharing config snapshots

## 🤝 Contributing

Contributions are welcome! If you add a new Smith or enhance an existing tool, update the README table and changelog with a short summary.

1. Fork & branch: `git checkout -b feature/amazing-idea`
2. Install deps: `npm install`
3. Run dev server: `npm run dev`
4. Add tests or stories if applicable, then open a PR.

## 📄 License

MIT © 2025 Smith Suite contributors