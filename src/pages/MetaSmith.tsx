import { useMemo, useState } from "react";

const defaultState = {
  title: "IconSmith Suite",
  description: "Browser-native utilities for icons, palettes, favicons, OG images, sprites, and more.",
  url: "https://iconsmith.app",
  image: "https://iconsmith.app/og-image.png",
  themeColor: "#111827",
  twitterHandle: "@iconsmith",
};

export default function MetaSmithPage() {
  const [meta, setMeta] = useState(defaultState);

  const htmlHead = useMemo(() => buildHead(meta), [meta]);

  function update<K extends keyof typeof defaultState>(key: K, value: typeof defaultState[K]) {
    setMeta((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">MetaSmith</h1>
            <p className="text-sm text-slate-200/80">
              Generate {"<head>"} metadata snippets covering favicons, Open Graph, Twitter cards, and theme colours.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white/20"
            onClick={() => navigator.clipboard.writeText(htmlHead)}
          >
            Copy snippet
          </button>
        </div>
      </div>

      <section className="grid flex-1 gap-6 lg:grid-cols-[360px_1fr]">
        <form className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
          <Field label="Title" value={meta.title} onChange={(v) => update("title", v)} />
          <Field label="Description" value={meta.description} onChange={(v) => update("description", v)} multiline rows={3} />
          <Field label="Canonical URL" value={meta.url} onChange={(v) => update("url", v)} />
          <Field label="Preview image" value={meta.image} onChange={(v) => update("image", v)} />
          <Field label="Theme colour" value={meta.themeColor} onChange={(v) => update("themeColor", v)} type="color" />
          <Field label="Twitter handle" value={meta.twitterHandle} onChange={(v) => update("twitterHandle", v)} />
        </form>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-purple-900/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">HTML head snippet</h2>
          <pre className="h-96 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] text-cyan-100 shadow-inner shadow-cyan-900/30">{htmlHead}</pre>
        </div>
      </section>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  type?: string;
};

function Field({ label, value, onChange, multiline, rows = 2, type = "text" }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-cyan-300 focus:outline-none"
        />
      ) : type === "color" ? (
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-24 cursor-pointer rounded-xl border border-white/10 bg-white/10"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
        />
      )}
    </label>
  );
}

function buildHead(meta: typeof defaultState) {
  return `<!-- Base -->
<title>${meta.title}</title>
<meta name="description" content="${meta.description}">
<link rel="canonical" href="${meta.url}">
<link rel="icon" href="/favicon.ico">
<meta name="theme-color" content="${meta.themeColor}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:url" content="${meta.url}">
<meta property="og:image" content="${meta.image}">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${meta.title}">
<meta name="twitter:description" content="${meta.description}">
<meta name="twitter:image" content="${meta.image}">
<meta name="twitter:site" content="${meta.twitterHandle}">
`;
}
