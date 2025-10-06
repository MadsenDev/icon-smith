import { useMemo, useState } from "react";
import { marked } from "marked";

const defaultMarkdown = `---
title: "IconSmith"
subtitle: "Browser-native icon generator"
---

# Meet IconSmith

Create platform-specific icons **without** leaving your browser. Supports Android, iOS, Windows, and web favicons.
`;

const previewThemes = {
  dark: {
    label: "Dark",
    wrapper: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur text-white",
    article: "prose prose-invert mt-4 max-w-none",
  },
  light: {
    label: "Light",
    wrapper: "rounded-3xl border border-slate-200/70 bg-white/95 p-6 text-slate-900 shadow-2xl shadow-slate-900/10",
    article: "prose mt-4 max-w-none text-slate-900",
  },
  serif: {
    label: "Serif",
    wrapper: "rounded-3xl border border-amber-200/60 bg-amber-50/90 p-6 text-slate-900 shadow-2xl shadow-amber-900/10",
    article: "prose prose-lg mt-4 max-w-none text-slate-900 font-serif prose-headings:font-serif",
  },
} as const;

type ThemeKey = keyof typeof previewThemes;

type MarkdownStats = {
  wordCount: number;
  charCount: number;
  lineCount: number;
  readingTime: number;
};

type TocHeading = {
  level: number;
  text: string;
  slug: string;
};

export default function MarkdownSmithPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [showFrontmatter, setShowFrontmatter] = useState(true);
  const [previewTheme, setPreviewTheme] = useState<ThemeKey>("dark");
  const [copiedTarget, setCopiedTarget] = useState<null | "html" | "markdown">(null);

  const strippedMarkdown = useMemo(() => stripFrontmatter(markdown), [markdown]);
  const html = useMemo(() => {
    const renderer = new marked.Renderer();
    const textRenderer = new marked.TextRenderer();
    renderer.heading = (token) => {
      const inline = renderer.parser.parseInline(token.tokens);
      const plain = renderer.parser.parseInline(token.tokens, textRenderer);
      const slug = slugify(typeof plain === "string" ? plain : String(plain));
      return `<h${token.depth} id="${slug}">${inline}</h${token.depth}>`;
    };
    return marked.parse(strippedMarkdown, { breaks: true, renderer });
  }, [strippedMarkdown]);

  const stats = useMemo<MarkdownStats>(() => {
    const body = strippedMarkdown.trim();
    if (!body) {
      return { wordCount: 0, charCount: 0, lineCount: 0, readingTime: 0 };
    }
    const wordCount = body.split(/\s+/).filter(Boolean).length;
    const charCount = body.length;
    const lineCount = body.split(/\r?\n/).length;
    const readingTime = wordCount === 0 ? 0 : Math.max(1, Math.round(wordCount / 200));
    return { wordCount, charCount, lineCount, readingTime };
  }, [strippedMarkdown]);

  const frontmatter = useMemo(() => extractFrontmatter(markdown), [markdown]);
  const frontmatterData = useMemo(() => parseFrontmatter(frontmatter), [frontmatter]);

  const headings = useMemo<TocHeading[]>(() => {
    const regex = /^(\#{1,6})\s+(.+)$/gm;
    const collected: TocHeading[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(strippedMarkdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const slug = slugify(text);
      collected.push({ level, text, slug });
    }
    return collected;
  }, [strippedMarkdown]);

  const theme = previewThemes[previewTheme];
  const downloadBase = frontmatterData.title ?? headings[0]?.text ?? "markdownsmith-document";

  async function handleCopy(target: "html" | "markdown") {
    try {
      await navigator.clipboard.writeText(target === "html" ? html : markdown);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget(null), 1200);
    } catch (error) {
      console.error(error);
    }
  }

  function downloadHtml() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = `${slugify(downloadBase) || "markdown"}.html`;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">MarkdownSmith</h1>
            <p className="text-sm text-slate-200/80">
              Convert Markdown into HTML/MDX-ready snippets. Edit frontmatter, preview styles, and copy share-ready markup.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-200/80">
              <input
                type="checkbox"
                checked={showFrontmatter}
                onChange={(e) => setShowFrontmatter(e.target.checked)}
                className="h-4 w-4"
              />
              Show frontmatter
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-200/80">
              <span className="text-cyan-200/80">Theme</span>
              {Object.entries(previewThemes).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPreviewTheme(key as ThemeKey)}
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.35em] transition ${
                    previewTheme === key ? "border-cyan-300 bg-cyan-500/30 text-white" : "border-white/10 bg-white/10 text-slate-200 hover:bg-white/20"
                  }`}
                >
                  {value.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleCopy("markdown")}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20"
            >
              {copiedTarget === "markdown" ? "Copied MD" : "Copy Markdown"}
            </button>
            <button
              type="button"
              onClick={() => handleCopy("html")}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20"
            >
              {copiedTarget === "html" ? "Copied HTML" : "Copy HTML"}
            </button>
            <button
              type="button"
              onClick={downloadHtml}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20"
            >
              Download HTML
            </button>
          </div>
        </div>
      </div>

      <section className="grid flex-1 gap-6 lg:grid-cols-[480px_1fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={24}
            className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-sm text-cyan-100 shadow-inner shadow-black/40 focus:border-cyan-300 focus:outline-none"
          />
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
            <p className="font-semibold text-white">Tips</p>
            <ul className="mt-2 space-y-1 text-[11px]">
              <li>• Supports frontmatter blocks; toggle visibility if you want to export MDX.</li>
              <li>• Links, lists, code blocks, and tables render using the default Markdown renderer.</li>
              <li>• Use inline HTML for advanced layouts; the preview reflects it.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className={theme.wrapper}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Preview</h2>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em]">
                {previewThemes[previewTheme].label}
              </span>
            </div>
            <article className={theme.article} dangerouslySetInnerHTML={{ __html: html }} />
          </div>

          <StatsPanel stats={stats} />

          {headings.length > 0 && <TableOfContents headings={headings} />}

          {showFrontmatter && frontmatter.trim().length > 0 && (
            <FrontmatterPanel frontmatter={frontmatter} data={frontmatterData} />
          )}
        </div>
      </section>
    </div>
  );
}

function StatsPanel({ stats }: { stats: MarkdownStats }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-2xl shadow-teal-900/20 backdrop-blur">
      <h2 className="text-lg font-semibold text-white">Document stats</h2>
      <ul className="mt-3 space-y-1">
        <li>
          <strong className="text-white">{stats.wordCount.toLocaleString()}</strong> words
        </li>
        <li>
          <strong className="text-white">{stats.charCount.toLocaleString()}</strong> characters
        </li>
        <li>
          <strong className="text-white">{stats.lineCount.toLocaleString()}</strong> lines
        </li>
        <li>
          Reading time: <span className="text-white">{stats.readingTime > 0 ? `${stats.readingTime} min` : "—"}</span>
        </li>
      </ul>
    </div>
  );
}

function TableOfContents({ headings }: { headings: TocHeading[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-2xl shadow-emerald-900/20 backdrop-blur">
      <h2 className="text-lg font-semibold text-white">Outline</h2>
      <ul className="mt-3 space-y-2">
        {headings.map((heading) => (
          <li key={`${heading.slug}-${heading.level}`} className="flex gap-3">
            <span className="text-cyan-200/80">{heading.level}</span>
            <a href={`#${heading.slug}`} className="flex-1 text-slate-100 transition hover:text-white">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FrontmatterPanel({ frontmatter, data }: { frontmatter: string; data: Record<string, string> }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur">
      <h2 className="text-lg font-semibold text-white">Frontmatter</h2>
      {Object.keys(data).length > 0 ? (
        <ul className="mt-3 space-y-2 text-xs text-slate-300">
          {Object.entries(data).map(([key, value]) => (
            <li key={key} className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">{key}</p>
              <p className="text-white">{value}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-slate-300">No key/value pairs detected.</p>
      )}
      <pre className="mt-4 max-h-48 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] text-cyan-100 shadow-inner shadow-cyan-900/30">
        {frontmatter.trim()}
      </pre>
    </div>
  );
}

function extractFrontmatter(input: string) {
  const match = input.match(/^---\n([\s\S]+?)\n---/);
  return match ? match[1].trim() : "";
}

function stripFrontmatter(input: string) {
  return input.replace(/^---\n([\s\S]+?)\n---\n?/, "").trimStart();
}

function parseFrontmatter(raw: string): Record<string, string> {
  if (!raw.trim()) return {};
  const result: Record<string, string> = {};
  raw.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([^:]+):\s*(.+)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, "");
      result[key] = value;
    }
  });
  return result;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
