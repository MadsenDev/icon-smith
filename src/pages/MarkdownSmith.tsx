import { useMemo, useState } from "react";
import { marked } from "marked";

const defaultMarkdown = `---
title: "IconSmith"
subtitle: "Browser-native icon generator"
---

# Meet IconSmith

Create platform-specific icons **without** leaving your browser. Supports Android, iOS, Windows, and web favicons.
`;

export default function MarkdownSmithPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [showFrontmatter, setShowFrontmatter] = useState(true);
  const html = useMemo(() => marked.parse(markdown, { breaks: true }), [markdown]);

  function copyHtml() {
    navigator.clipboard.writeText(html).catch(() => {});
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
            <label className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-200/80">
              <input
                type="checkbox"
                checked={showFrontmatter}
                onChange={(e) => setShowFrontmatter(e.target.checked)}
                className="h-4 w-4"
              />
              Show frontmatter
            </label>
            <button
              type="button"
              onClick={copyHtml}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20"
            >
              Copy HTML
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
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Preview</h2>
            <article className="prose prose-invert mt-4 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
          </div>

          {showFrontmatter && markdown.trim().startsWith("---") && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">Frontmatter</h2>
              <pre className="mt-4 h-40 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] text-cyan-100 shadow-inner shadow-cyan-900/30">
                {extractFrontmatter(markdown)}
              </pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function extractFrontmatter(input: string) {
  const match = input.match(/^---\n([\s\S]+?)\n---/);
  return match ? match[1] : "";
}
