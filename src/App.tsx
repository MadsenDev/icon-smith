import { Suspense, useMemo, useState } from "react";
import { Link, NavLink, Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import { toolCards, type ToolCard } from "./data/tools";
import { ToolCardItem } from "./components/ToolCard";
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
import FormSmithPage from "./pages/FormSmith";
import PatternSmithPage from "./pages/PatternSmith";
import IconFontSmithPage from "./pages/IconFontSmith";
import StateSmithPage from "./pages/StateSmith";
import ExportSmithPage from "./pages/ExportSmith";
import FlowSmithPage from "./pages/FlowSmith";
import TestSmithPage from "./pages/TestSmith";
import TimelineSmithPage from "./pages/TimelineSmith";
import PDFSmithPage from "./pages/PDFSmith";

type DashboardCard = ToolCard;

const dashboardCards: DashboardCard[] = toolCards;

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
      { path: "form-smith", element: <FormSmithPage /> },
      { path: "pattern-smith", element: <PatternSmithPage /> },
      { path: "icon-font-smith", element: <IconFontSmithPage /> },
      { path: "state-smith", element: <StateSmithPage /> },
      { path: "export-smith", element: <ExportSmithPage /> },
      { path: "flow-smith", element: <FlowSmithPage /> },
      { path: "test-smith", element: <TestSmithPage /> },
      { path: "timeline-smith", element: <TimelineSmithPage /> },
      { path: "pdf-smith", element: <PDFSmithPage /> },
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
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCards = useMemo(() => {
    if (!normalizedQuery) return dashboardCards;
    return dashboardCards.filter((card) => {
      const haystack = [card.title, card.description, card.category, card.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const categories = useMemo(() => {
    const map = new Map<string, DashboardCard[]>();
    filteredCards.forEach((card) => {
      const list = map.get(card.category) ?? [];
      list.push(card);
      map.set(card.category, list);
    });
    return Array.from(map.entries());
  }, [filteredCards]);

  return (
    <div className="space-y-10 text-slate-200">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20 backdrop-blur">
        <label className="flex flex-col gap-3 text-sm text-slate-200">
          <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Search tools</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, tag, or capability"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none focus:border-cyan-400/60 focus:bg-black/40"
          />
        </label>
        <p className="mt-3 text-xs text-slate-400">
          Showing {filteredCards.length} tool{filteredCards.length === 1 ? "" : "s"}
          {normalizedQuery ? ` for “${query.trim()}”` : ""}.
        </p>
      </div>

      {filteredCards.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-slate-300 shadow-xl shadow-purple-900/20">
          <p>No tools match your search yet. Try a different keyword or tag.</p>
        </div>
      ) : (
        categories.map(([category, cards]) => (
          <section key={category}>
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold uppercase tracking-[0.4em] text-cyan-200/80">{category}</h2>
              <span className="text-xs text-slate-400">{cards.length} tool{cards.length === 1 ? "" : "s"}</span>
            </header>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => (
                <ToolCardItem key={card.title} card={card} />
              ))}
            </div>
          </section>
        ))
      )}
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
