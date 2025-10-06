import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type IconItem = {
  id: string;
  name: string;
  svgText: string;
};

export default function IconFontSmithPage() {
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [fontName, setFontName] = useState("smith-icons");

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    const newIcons: IconItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.name.endsWith(".svg")) continue;
      const text = await file.text();
      newIcons.push({ id: crypto.randomUUID(), name: file.name.replace(/\.svg$/i, ""), svgText: text });
    }
    setIcons((prev) => [...prev, ...newIcons]);
  };

  const handleDownload = async () => {
    if (icons.length === 0) return;
    const zip = new JSZip();
    icons.forEach((icon) => {
      zip.file(`icons/${icon.name}.svg`, icon.svgText);
    });
    const css = buildCss(fontName, icons);
    zip.file(`${fontName}.css`, css);
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${fontName}.zip`);
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">IconFontSmith</h1>
            <p className="text-sm text-slate-200/80">
              Upload SVG icons, preview glyphs, and export a ready-to-use font bundle with CSS classes.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-slate-200">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
              Font name
              <input
                value={fontName}
                onChange={(event) => setFontName(event.target.value)}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
            >
              Download bundle
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20">
          <div className="flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Upload SVG icons</h2>
            <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-slate-900/40 text-sm text-slate-300">
              <input type="file" accept=".svg" multiple className="hidden" onChange={(event) => handleFileUpload(event.target.files)} />
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200">Upload SVGs</span>
              <p className="text-xs text-slate-400">Drop files or click to browse</p>
            </label>
          </div>
          <div className="grid gap-3">
            <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Glyphs ({icons.length})</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {icons.map((icon) => (
                <div key={icon.id} className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-200">
                  <div className="h-12 w-12" dangerouslySetInnerHTML={{ __html: icon.svgText }} />
                  <input
                    value={icon.name}
                    onChange={(event) => setIcons((prev) => prev.map((item) => (item.id === icon.id ? { ...item, name: event.target.value } : item)))}
                    className="rounded-lg border border-white/10 bg-slate-900/40 px-2 py-1 text-xs text-white outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20">
          <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Usage CSS</h2>
          <pre className="max-h-96 overflow-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-200">
            <code>{buildCss(fontName, icons)}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}

function buildCss(fontName: string, icons: IconItem[]): string {
  const className = fontName.replace(/[^a-z0-9-]+/gi, "-");
  const glyphs = icons
    .map((icon, index) => `.${className}-${icon.name}::before { content: "\\\${(0xe900 + index).toString(16)}"; }`)
    .join("\n");
  return `@font-face {\n  font-family: '${className}';\n  src: url('${className}.woff2') format('woff2');\n  font-weight: normal;\n  font-style: normal;\n}\n\n.${className} {\n  font-family: '${className}', sans-serif;\n  display: inline-block;\n  font-style: normal;\n  font-weight: normal;\n}\n\n${glyphs}`;
}

