# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once tagged releases begin.

## [0.1.0]

### Added
- Comprehensive dashboard with categories and dropdown navigation
- PaletteSmith for extracting color palettes and exporting Tailwind/CSS/JSON
- FaviconSmith for favicon bundles and manifest generation
- OGSmith with templated Open Graph image composer
- RenameSmith for batch renaming assets (casing rules + find/replace)
- ContrastSmith for colour contrast auditing with WCAG guidance
- ShapeSmith for hero blobs, divider waves, and exportable SVG/React snippets
- ShadowSmith for layered shadows, glassmorphism, and neon glow exports
- NoiseSmith for grain/dust/scan-line texture generation with PNG/data URL exports
- RegexSmith for live regex testing, replacements, and flag explanations
- DiffSmith for text/JSON diffs with split/unified views and change summaries
- DataSmith for synthetic dataset generation with repeatable seeds and CSV/JSON exports
- SpriteSmith for sprite sheet generation with CSS/JSON metadata
- AssetSmith for client-side image compression and bundling
- TokenSmith for design token conversion (JSON, CSS vars, Tailwind, Style Dictionary)
- MetaSmith for `<head>` metadata snippet generation
- GradientSmith for multi-stop gradient design and export
- MarkdownSmith for Markdown → HTML preview with frontmatter
- LocaleSmith for localisation diff/merge and report export
- MockupSmith for device/browser mockup exports

### Improved
- IconSmith quality hints, shape overlays, and browser-only pipeline
- Navigation supports dropdown for secondary tools and responsive layout
- Dashboard cards grouped by category with tool counts

### Fixed
- Prevented TokenSmith parsing from triggering re-render loops
- Resolved navigation redeclaration issues in `App.tsx`

