import { Suspense, useMemo, useState } from "react";
import { Link, NavLink, Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import IconSmithPage from "./pages/IconSmith";
import PaletteSmithPage from "./pages/PaletteSmith";
import FaviconSmithPage from "./pages/FaviconSmith";
import OGSmithPage from "./pages/OGSmith";
import RenameSmithPage from "./pages/RenameSmith";
import ContrastSmithPage from "./pages/ContrastSmith";
import ShapeSmithPage from "./pages/ShapeSmith";
import ShadowSmithPage from "./pages/ShadowSmith";
import NoiseSmithPage from "./pages/NoiseSmith";
import RegexSmithPage from "./pages/RegexSmith";
import DiffSmithPage from "./pages/DiffSmith";
import DataSmithPage from "./pages/DataSmith";
import SchemaSmithPage from "./pages/SchemaSmith";
import SpriteSmithPage from "./pages/SpriteSmith";
import AssetSmithPage from "./pages/AssetSmith";
import TokenSmithPage from "./pages/TokenSmith";
import MetaSmithPage from "./pages/MetaSmith";
import GradientSmithPage from "./pages/GradientSmith";
import MarkdownSmithPage from "./pages/MarkdownSmith";
import LocaleSmithPage from "./pages/LocaleSmith";
import MockupSmithPage from "./pages/MockupSmith";
import AnimationSmithPage from "./pages/AnimationSmith";
import TypographySmithPage from "./pages/TypographySmith";
import LayoutSmithPage from "./pages/LayoutSmith";
import AuditSmithPage from "./pages/AuditSmith";
import VersionSmithPage from "./pages/VersionSmith";

type DashboardCard = {
  title: string;
  description: string;
  badge: string;
  cta: string;
  href: string;
  category: string;
};

const dashboardCards: DashboardCard[] = [
  {
    title: "IconSmith",
    description: "Resize, pad, and package icons for every platform in seconds.",
    badge: "<span role='img' aria-hidden='true'>🎯</span> Ready",
    cta: "Launch tool",
    href: "/icon-smith",
    category: "Design",
  },
  {
    title: "PaletteSmith",
    description: "Extract colour palettes, export Tailwind config, CSS variables, and JSON.",
    badge: "<span role='img' aria-hidden='true'>🎨</span> Ready",
    cta: "Launch tool",
    href: "/palette-smith",
    category: "Design",
  },
  {
    title: "FaviconSmith",
    description: "Generate favicon sets and web manifest snippets from any source image.",
    badge: "<span role='img' aria-hidden='true'>⚙️</span> Ready",
    cta: "Launch tool",
    href: "/favicon-smith",
    category: "Assets",
  },
  {
    title: "OGSmith",
    description: "Compose on-brand Open Graph images with templated layouts.",
    badge: "<span role='img' aria-hidden='true'>🖼️</span> Ready",
    cta: "Launch tool",
    href: "/og-smith",
    category: "Content",
  },
  {
    title: "RenameSmith",
    description: "Batch rename assets using tokens and smart casing rules.",
    badge: "<span role='img' aria-hidden='true'>🧰</span> Ready",
    cta: "Launch tool",
    href: "/rename-smith",
    category: "Productivity",
  },
  {
    title: "ContrastSmith",
    description: "Audit colour pairs against WCAG AA/AAA targets with actionable tweaks.",
    badge: "<span role='img' aria-hidden='true'>🌓</span> Ready",
    cta: "Launch tool",
    href: "/contrast-smith",
    category: "Accessibility",
  },
  {
    title: "ShapeSmith",
    description: "Generate hero blobs, waves, stars, and patterns with exportable SVG/React code.",
    badge: "<span role='img' aria-hidden='true'>🪩</span> Ready",
    cta: "Launch tool",
    href: "/shape-smith",
    category: "Design",
  },
  {
    title: "AnimationSmith",
    description: "Compose keyframes, tweak easing, and export CSS/JSON timelines.",
    badge: "<span role='img' aria-hidden='true'>🎞️</span> Ready",
    cta: "Launch tool",
    href: "/animation-smith",
    category: "Design",
  },
  {
    title: "ShadowSmith",
    description: "Craft multi-layer shadows, glassmorphism, and neon glows with exportable CSS.",
    badge: "<span role='img' aria-hidden='true'>🌌</span> Ready",
    cta: "Launch tool",
    href: "/shadow-smith",
    category: "Design",
  },
  {
    title: "NoiseSmith",
    description: "Generate subtle film grain, dust, and scan line textures on demand.",
    badge: "<span role='img' aria-hidden='true'>🎚️</span> Ready",
    cta: "Launch tool",
    href: "/noise-smith",
    category: "Design",
  },
  {
    title: "RegexSmith",
    description: "Explore regex matches, replacements, and explanations with live feedback.",
    badge: "<span role='img' aria-hidden='true'>🔍</span> Ready",
    cta: "Launch tool",
    href: "/regex-smith",
    category: "Utilities",
  },
  {
    title: "DiffSmith",
    description: "Compare text or JSON, view unified or split diffs, and summarise changes.",
    badge: "<span role='img' aria-hidden='true'>🧮</span> Ready",
    cta: "Launch tool",
    href: "/diff-smith",
    category: "Utilities",
  },
  {
    title: "DataSmith",
    description: "Synthesize fake datasets with seeds, presets, and JSON/CSV exports.",
    badge: "<span role='img' aria-hidden='true'>🧪</span> Ready",
    cta: "Launch tool",
    href: "/data-smith",
    category: "Utilities",
  },
  {
    title: "SchemaSmith",
    description: "Design MySQL schemas with tables and columns, then export CREATE statements.",
    badge: "<span role='img' aria-hidden='true'>🗄️</span> Ready",
    cta: "Launch tool",
    href: "/schema-smith",
    category: "Utilities",
  },
  {
    title: "SpriteSmith",
    description: "Combine icons into spritesheets with CSS/JSON metadata exports.",
    badge: "<span role='img' aria-hidden='true'>🧩</span> Ready",
    cta: "Launch tool",
    href: "/sprite-smith",
    category: "Assets",
  },
  {
    title: "AssetSmith",
    description: "Compress images with adjustable quality and bundle exports.",
    badge: "<span role='img' aria-hidden='true'>📦</span> Ready",
    cta: "Launch tool",
    href: "/asset-smith",
    category: "Assets",
  },
  {
    title: "TokenSmith",
    description: "Convert design tokens between JSON, CSS variables, Tailwind config, and more.",
    badge: "<span role='img' aria-hidden='true'>🎛️</span> Ready",
    cta: "Launch tool",
    href: "/token-smith",
    category: "Design",
  },
  {
    title: "TypographySmith",
    description: "Explore font pairings and fluid scales with instant CSS exports.",
    badge: "<span role='img' aria-hidden='true'>🅰️</span> Ready",
    cta: "Launch tool",
    href: "/typography-smith",
    category: "Design",
  },
  {
    title: "MetaSmith",
    description: "Build and validate head metadata: favicons, OG/Twitter tags, manifests.",
    badge: "<span role='img' aria-hidden='true'>🧭</span> Ready",
    cta: "Launch tool",
    href: "/meta-smith",
    category: "Metadata",
  },
  {
    title: "GradientSmith",
    description: "Craft multi-stop gradients, export CSS/Tailwind, preview on mock devices.",
    badge: "<span role='img' aria-hidden='true'>🌈</span> Ready",
    cta: "Launch tool",
    href: "/gradient-smith",
    category: "Design",
  },
  {
    title: "MarkdownSmith",
    description: "Convert Markdown to HTML/MDX, edit frontmatter, generate OG previews.",
    badge: "<span role='img' aria-hidden='true'>📝</span> Ready",
    cta: "Launch tool",
    href: "/markdown-smith",
    category: "Content",
  },
  {
    title: "LocaleSmith",
    description: "Compare, merge, and QA localisation files across languages.",
    badge: "<span role='img' aria-hidden='true'>🌍</span> Ready",
    cta: "Launch tool",
    href: "/locale-smith",
    category: "Productivity",
  },
  {
    title: "VersionSmith",
    description: "Compare JSON snapshots, highlight drift, and deep merge token sets.",
    badge: "<span role='img' aria-hidden='true'>🗂️</span> Ready",
    cta: "Launch tool",
    href: "/version-smith",
    category: "Productivity",
  },
  {
    title: "MockupSmith",
    description: "Place assets into device/browser mockups for presentations and OG images.",
    badge: "<span role='img' aria-hidden='true'>📱</span> Ready",
    cta: "Launch tool",
    href: "/mockup-smith",
    category: "Design",
  },
  {
    title: "LayoutSmith",
    description: "Prototype grid and flex wrappers with responsive CSS snippets.",
    badge: "<span role='img' aria-hidden='true'>🧱</span> Ready",
    cta: "Launch tool",
    href: "/layout-smith",
    category: "Design",
  },
  {
    title: "AuditSmith",
    description: "Run accessibility heuristics and colour contrast checks in one view.",
    badge: "<span role='img' aria-hidden='true'>♿</span> Ready",
    cta: "Launch tool",
    href: "/audit-smith",
    category: "Accessibility",
  },
];

const navLinks = dashboardCards.map(({ href, title }) => ({ to: href.replace(/^\//, ""), label: title }));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "icon-smith", element: <IconSmithPage /> },
      { path: "palette-smith", element: <PaletteSmithPage /> },
      { path: "favicon-smith", element: <FaviconSmithPage /> },
      { path: "og-smith", element: <OGSmithPage /> },
      { path: "rename-smith", element: <RenameSmithPage /> },
      { path: "contrast-smith", element: <ContrastSmithPage /> },
      { path: "shape-smith", element: <ShapeSmithPage /> },
      { path: "shadow-smith", element: <ShadowSmithPage /> },
      { path: "noise-smith", element: <NoiseSmithPage /> },
      { path: "regex-smith", element: <RegexSmithPage /> },
      { path: "diff-smith", element: <DiffSmithPage /> },
      { path: "data-smith", element: <DataSmithPage /> },
      { path: "schema-smith", element: <SchemaSmithPage /> },
      { path: "sprite-smith", element: <SpriteSmithPage /> },
      { path: "asset-smith", element: <AssetSmithPage /> },
      { path: "token-smith", element: <TokenSmithPage /> },
      { path: "meta-smith", element: <MetaSmithPage /> },
      { path: "gradient-smith", element: <GradientSmithPage /> },
      { path: "markdown-smith", element: <MarkdownSmithPage /> },
      { path: "locale-smith", element: <LocaleSmithPage /> },
      { path: "mockup-smith", element: <MockupSmithPage /> },
      { path: "animation-smith", element: <AnimationSmithPage /> },
      { path: "typography-smith", element: <TypographySmithPage /> },
      { path: "layout-smith", element: <LayoutSmithPage /> },
      { path: "audit-smith", element: <AuditSmithPage /> },
      { path: "version-smith", element: <VersionSmithPage /> },
    ],
  },
]);

export default function App() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-950 text-slate-200">Loading tools…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

function RootLayout() {
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryNav = navLinks.slice(0, 4);
  const secondaryNav = navLinks.slice(4);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-500/30 via-transparent to-transparent blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-purple-600/30 via-transparent to-transparent blur-3xl" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col px-4 pb-12 pt-10 sm:px-8 lg:px-12 xl:px-16">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-200/90 ring-1 ring-white/20">Smith Suite</span>
            <h1 className="text-2xl font-semibold text-white">Forge of tiny dev/design tools.</h1>
          </Link>
          <nav className="flex flex-col gap-2 text-sm text-slate-200 md:items-end">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
              {primaryNav.map((tool) => (
                <NavLink
                  key={tool.to}
                  to={tool.to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-full border border-white/10 px-4 py-1 transition ${
                      isActive ? "bg-white/15 text-white" : "bg-white/5 text-slate-200 hover:bg-white/10"
                    }`
                  }
                >
                  {tool.label}
                </NavLink>
              ))}
              {secondaryNav.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMoreOpen((prev) => !prev)}
                    className={`rounded-full border border-white/10 px-4 py-1 uppercase tracking-[0.35em] transition ${
                      moreOpen ? "bg-white/20 text-white" : "bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                    aria-haspopup="true"
                    aria-expanded={moreOpen}
                  >
                    More
                  </button>
                  {moreOpen && (
                    <div
                      className="absolute right-0 z-20 mt-2 w-60 rounded-2xl border border-white/10 bg-slate-900/95 p-3 shadow-xl shadow-cyan-900/30"
                      onMouseLeave={() => setMoreOpen(false)}
                    >
                      <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">Tools</p>
                      <div className="grid gap-1">
                        {secondaryNav.map((tool) => (
                          <NavLink
                            key={tool.to}
                            to={tool.to}
                            onClick={() => setMoreOpen(false)}
                            className={({ isActive }) =>
                              `rounded-xl px-3 py-2 text-sm transition ${
                                isActive ? "bg-white/15 text-white" : "text-slate-200 hover:bg-white/10"
                              }`
                            }
                          >
                            {tool.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </header>

        <main className="mt-8 flex-1">
          <Outlet />
        </main>

        <footer className="mt-8 flex flex-col gap-2 text-xs text-slate-400">
          <p>Crafted with React, Vite, Tailwind, and a love for delightful utilities.</p>
          <p className="text-slate-500">More tools coming soon — contributions welcome!</p>
        </footer>
      </div>
    </div>
  );
}

function HomePage() {
  const categories = useMemo(() => {
    const map = new Map<string, DashboardCard[]>();
    dashboardCards.forEach((card) => {
      const list = map.get(card.category) ?? [];
      list.push(card);
      map.set(card.category, list);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <div className="space-y-10 text-slate-200">
      {categories.map(([category, cards]) => (
        <section key={category}>
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-[0.4em] text-cyan-200/80">{category}</h2>
            <span className="text-xs text-slate-400">{cards.length} tool{cards.length === 1 ? "" : "s"}</span>
          </header>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.href}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-transparent to-purple-600/20 opacity-0 transition group-hover:opacity-100" />
                <div className="relative z-10 space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-100" dangerouslySetInnerHTML={{ __html: card.badge }} />
                  <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-slate-200/80">{card.description}</p>
                  <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">{card.cta}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
      </div>
  );
}

function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-200 shadow-2xl shadow-cyan-900/20">
      <span className="rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-200">In development</span>
      <h2 className="text-3xl font-semibold text-white">{title}</h2>
      <p className="max-w-md text-sm text-slate-300">{description}</p>
      <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Stay tuned</p>
    </div>
  );
}
