import { useMemo, useState } from "react";
import { saveAs } from "file-saver";

type PatternType = "stripes" | "dots" | "hex" | "chevron" | "grid";

type PatternSettings = {
  type: PatternType;
  foreground: string;
  background: string;
  size: number;
  angle: number;
  spacing: number;
  opacity: number;
};

const defaultSettings: PatternSettings = {
  type: "stripes",
  foreground: "#38BDF8",
  background: "#020617",
  size: 16,
  angle: 45,
  spacing: 16,
  opacity: 0.8,
};

export default function PatternSmithPage() {
  const [settings, setSettings] = useState<PatternSettings>(defaultSettings);

  const svgMarkup = useMemo(() => buildPatternSvg(settings), [settings]);
  const cssSnippet = useMemo(() => buildCssSnippet(svgMarkup), [svgMarkup]);

  const handleDownload = () => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    saveAs(blob, `pattern-${settings.type}.svg`);
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">PatternSmith</h1>
            <p className="text-sm text-slate-200/80">
              Generate seamless background patterns — stripes, dots, chevrons, grids — and export as SVG or data URL for CSS.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full border border-white/10 bg-white/10 px-6 py-2 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
          >
            Download SVG
          </button>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20">
            <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Pattern controls</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                Type
                <select
                  value={settings.type}
                  onChange={(event) => setSettings((prev) => ({ ...prev, type: event.target.value as PatternType }))}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="stripes">Diagonal stripes</option>
                  <option value="dots">Dots</option>
                  <option value="hex">Hexagons</option>
                  <option value="chevron">Chevron</option>
                  <option value="grid">Grid</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                Size
                <input
                  type="number"
                  min={4}
                  max={120}
                  value={settings.size}
                  onChange={(event) => setSettings((prev) => ({ ...prev, size: clamp(Number(event.target.value), 4, 120) }))}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                Angle
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={settings.angle}
                  onChange={(event) => setSettings((prev) => ({ ...prev, angle: Number(event.target.value) }))}
                />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                Spacing
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={settings.spacing}
                  onChange={(event) => setSettings((prev) => ({ ...prev, spacing: clamp(Number(event.target.value), 0, 80) }))}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                Foreground
                <input
                  type="color"
                  value={settings.foreground}
                  onChange={(event) => setSettings((prev) => ({ ...prev, foreground: event.target.value }))}
                  className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/60"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                Background
                <input
                  type="color"
                  value={settings.background}
                  onChange={(event) => setSettings((prev) => ({ ...prev, background: event.target.value }))}
                  className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/60"
                />
              </label>
            </div>
            <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
              Opacity
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={settings.opacity}
                onChange={(event) => setSettings((prev) => ({ ...prev, opacity: Number(event.target.value) }))}
              />
            </label>
          </div>
          <PatternPreview svgMarkup={svgMarkup} />
        </section>

        <aside className="flex flex-col gap-6">
          <ExportBlock title="SVG markup" code={svgMarkup} />
          <ExportBlock title="CSS background" code={cssSnippet} />
        </aside>
      </div>
    </div>
  );
}

function PatternPreview({ svgMarkup }: { svgMarkup: string }) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Preview</p>
        <h2 className="text-sm font-semibold text-white">Tile preview</h2>
      </header>
      <div
        className="h-64 w-full rounded-2xl border border-white/10"
        style={{ backgroundImage: `url('data:image/svg+xml;base64,${btoa(svgMarkup)}')` }}
      />
    </div>
  );
}

function ExportBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Export</p>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(code).catch(() => {})}
          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
        >
          Copy
        </button>
      </header>
      <pre className="max-h-64 overflow-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function buildPatternSvg(settings: PatternSettings): string {
  const viewBox = `0 0 ${settings.size + settings.spacing} ${settings.size + settings.spacing}`;
  const commonAttrs = `fill=\"${settings.foreground}\" fill-opacity=\"${settings.opacity}\"`;

  switch (settings.type) {
    case "stripes":
      return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${settings.size}" height="${settings.size}" viewBox="0 0 ${settings.size} ${settings.size}" preserveAspectRatio="xMinYMin slice">\n  <rect width="${settings.size}" height="${settings.size}" fill="${settings.background}"/>\n  <g transform="rotate(${settings.angle} ${settings.size / 2} ${settings.size / 2})">\n    <rect x="-${settings.size}" width="${settings.size / 2}" height="${settings.size * 3}" ${commonAttrs}/>\n  </g>\n</svg>`;
    case "dots":
      return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${settings.size + settings.spacing}" height="${settings.size + settings.spacing}" viewBox="${viewBox}">\n  <rect width="${settings.size + settings.spacing}" height="${settings.size + settings.spacing}" fill="${settings.background}"/>\n  <circle cx="${(settings.size + settings.spacing) / 2}" cy="${(settings.size + settings.spacing) / 2}" r="${settings.size / 3}" ${commonAttrs}/>\n</svg>`;
    case "hex":
      const radius = settings.size / 2;
      const path = buildHexagonPath(radius);
      return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${settings.size + settings.spacing}" height="${settings.size + settings.spacing}" viewBox="${viewBox}">\n  <rect width="${settings.size + settings.spacing}" height="${settings.size + settings.spacing}" fill="${settings.background}"/>\n  <path d="${path}" transform="translate(${(settings.size + settings.spacing) / 2}, ${(settings.size + settings.spacing) / 2})" ${commonAttrs}/>\n</svg>`;
    case "chevron":
      return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${settings.size + settings.spacing}" height="${settings.size + settings.spacing}" viewBox="${viewBox}">\n  <rect width="${settings.size + settings.spacing}" height="${settings.size + settings.spacing}" fill="${settings.background}"/>\n  <polyline points="0 ${settings.size / 2} ${(settings.size + settings.spacing) / 2} 0 ${settings.size + settings.spacing} ${settings.size / 2}" stroke="${settings.foreground}" stroke-width="${Math.max(2, settings.size / 6)}" fill="none" stroke-linecap="round" stroke-opacity="${settings.opacity}"/>\n</svg>`;
    case "grid":
    default:
      const strokeWidth = Math.max(1, settings.size / 10);
      return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${settings.size + settings.spacing}" height="${settings.size + settings.spacing}" viewBox="${viewBox}">\n  <rect width="${settings.size + settings.spacing}" height="${settings.size + settings.spacing}" fill="${settings.background}"/>\n  <path d="M0 ${(settings.size + settings.spacing) / 2} H ${settings.size + settings.spacing} M ${(settings.size + settings.spacing) / 2} 0 V ${settings.size + settings.spacing}" stroke="${settings.foreground}" stroke-width="${strokeWidth}" stroke-opacity="${settings.opacity}" fill="none"/>\n</svg>`;
  }
}

function buildCssSnippet(svgMarkup: string): string {
  return `background-image: url("data:image/svg+xml;base64,${btoa(svgMarkup)}");`;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function buildHexagonPath(radius: number): string {
  const points = Array.from({ length: 6 }).map((_, index) => {
    const angle = (Math.PI / 3) * index;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return `${x},${y}`;
  });
  return `M ${points.join(" L ")} Z`;
}

