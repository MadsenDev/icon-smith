import { useMemo, useState } from "react";
import { generateShapePath, type ShapeVariant } from "../utils/shape";

type ExportFormat = "svg" | "jsx" | "tsx" | "html";

const variants: { label: string; value: ShapeVariant; description: string }[] = [
  { label: "Organic blob", value: "blob", description: "Soft organic shape with gentle curves" },
  { label: "Fluid wave", value: "wave", description: "Wavy hero section silhouette" },
  { label: "Zigzag", value: "zigzag", description: "Angular pattern for top/bottom dividers" },
  { label: "Arches", value: "arch", description: "Repeating arches for architectural vibes" },
  { label: "Rounded grid", value: "grid", description: "Tile grid with softened corners" },
  { label: "Starburst", value: "star", description: "Geometric star for badges" },
  { label: "Petal burst", value: "petal", description: "Radial petals with organic variation" },
];

const palettes = [
  { name: "Aurora", stops: ["#6EE7B7", "#3B82F6", "#9333EA"] },
  { name: "Sunset", stops: ["#FB923C", "#F97316", "#EA580C"] },
  { name: "Neon", stops: ["#22D3EE", "#8B5CF6", "#EC4899"] },
  { name: "Mono", stops: ["#0F172A", "#1E293B", "#475569"] },
];

const exportFormats: { label: string; value: ExportFormat }[] = [
  { label: "SVG", value: "svg" },
  { label: "React JSX", value: "jsx" },
  { label: "React TSX", value: "tsx" },
  { label: "HTML", value: "html" },
];

export default function ShapeSmithPage() {
  const [variant, setVariant] = useState<ShapeVariant>("blob");
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [complexity, setComplexity] = useState(4);
  const [amplitude, setAmplitude] = useState(0.5);
  const [seed, setSeed] = useState(1234);
  const [fill, setFill] = useState("gradient");
  const [palette, setPalette] = useState(palettes[0]);
  const [background, setBackground] = useState("#020617");
  const [outline, setOutline] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("svg");

  const path = useMemo(() => generateShapePath(variant, { complexity, amplitude, seed }, width, height), [
    variant,
    width,
    height,
    complexity,
    amplitude,
    seed,
  ]);

  const exportedCode = useMemo(() => buildExport({
    format: exportFormat,
    width,
    height,
    path,
    fill,
    palette,
    outline,
  }), [exportFormat, width, height, path, fill, palette, outline]);

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">ShapeSmith</h1>
            <p className="text-sm text-slate-200/80">
              Forge hero blobs, divider waves, and geometric patterns. Export as SVG or ready-to-drop React components.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white transition hover:bg-white/20"
              onClick={() => setSeed(Math.floor(Math.random() * 10000))}
            >
              Shuffle seed
            </button>
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-200/70">
              <span className="uppercase tracking-[0.35em] text-cyan-200/80">Canvas</span>
              <input
                type="number"
                value={width}
                onChange={(event) => setWidth(clampNumber(event.target.value, 64, 1200))}
                className="w-16 bg-transparent text-sm text-white outline-none"
              />
              <span className="text-slate-400">×</span>
              <input
                type="number"
                value={height}
                onChange={(event) => setHeight(clampNumber(event.target.value, 64, 1200))}
                className="w-16 bg-transparent text-sm text-white outline-none"
              />
            </label>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20 backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {variants.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setVariant(item.value)}
                  className={`group rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    variant === item.value ? "border-cyan-400/60 bg-cyan-500/15 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-slate-300">{item.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20 backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SliderField
                label="Complexity"
                value={complexity}
                min={2}
                max={12}
                step={1}
                onChange={setComplexity}
                description="More points / arches"
              />
              <SliderField
                label="Amplitude"
                value={amplitude}
                min={0}
                max={1}
                step={0.05}
                onChange={setAmplitude}
                description="How dramatic the curves are"
              />
              <SliderField
                label="Seed"
                value={seed}
                min={0}
                max={9999}
                step={1}
                onChange={setSeed}
                description="Randomness for organic variants"
              />
              <ToggleField label="Outline" enabled={outline} onChange={setOutline} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
                <span className="uppercase tracking-[0.35em] text-cyan-200/80">Fill style</span>
                <div className="flex items-center gap-3">
                  <select
                    value={fill}
                    onChange={(event) => setFill(event.target.value)}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="solid">Solid</option>
                    <option value="gradient">Gradient</option>
                    <option value="none">Transparent</option>
                  </select>
                  {fill === "solid" && (
                    <input
                      type="color"
                      className="h-9 w-9 cursor-pointer rounded-full border border-white/20 bg-transparent"
                      value={palette.stops[0]}
                      onChange={(event) => setPalette({ ...palette, stops: [event.target.value, event.target.value, event.target.value] })}
                    />
                  )}
                </div>
              </label>

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
                <span className="uppercase tracking-[0.35em] text-cyan-200/80">Background</span>
                <input
                  type="color"
                  value={background}
                  onChange={(event) => setBackground(event.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-full border border-white/20 bg-transparent"
                />
              </label>
            </div>
          </div>

          {fill === "gradient" && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-teal-900/20 backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Gradient palettes</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {palettes.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setPalette(item)}
                    className={`rounded-2xl border p-4 text-left text-xs transition ${
                      palette.name === item.name ? "border-cyan-400/60 bg-cyan-500/15 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <p className="font-semibold text-white">{item.name}</p>
                    <div className="mt-3 h-12 rounded-xl" style={{ background: `linear-gradient(135deg, ${item.stops.join(", ")})` }} />
                    <p className="mt-2 font-mono text-[11px] text-cyan-100">{item.stops.join(" → ")}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20 backdrop-blur">
            <ShapePreview
              width={width}
              height={height}
              path={path}
              fill={fill}
              palette={palette}
              background={background}
              outline={outline}
              seed={seed}
              complexity={complexity}
              amplitude={amplitude}
              variant={variant}
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20 backdrop-blur">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <p className="uppercase tracking-[0.35em] text-cyan-200/80">Export</p>
              <div className="flex gap-2">
                {exportFormats.map((format) => (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => setExportFormat(format.value)}
                    className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] transition ${
                      exportFormat === format.value ? "border-cyan-400/60 bg-cyan-500/15 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 h-64 overflow-auto rounded-2xl bg-black/60 p-4 font-mono text-xs text-cyan-100 shadow-inner shadow-cyan-500/10">
              <pre className="whitespace-pre-wrap">{exportedCode}</pre>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-xl shadow-blue-900/20">
            <h2 className="text-sm font-semibold text-white">Workflow tips</h2>
            <ul className="mt-4 space-y-2">
              <li>• Pair ShapeSmith with GradientSmith to swap gradients quickly.</li>
              <li>• Use the grid variant as background patterns or noise overlays.</li>
              <li>• Export TSX for typed React components inside design systems.</li>
              <li>• Mix multiple shapes inside Figma or Framer for motion design.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ShapePreview({
  width,
  height,
  path,
  fill,
  palette,
  background,
  outline,
  seed,
  complexity,
  amplitude,
  variant,
}: {
  width: number;
  height: number;
  path: string;
  fill: string;
  palette: { name: string; stops: string[] };
  background: string;
  outline: boolean;
  seed: number;
  complexity: number;
  amplitude: number;
  variant: ShapeVariant;
}) {
  const gradientId = useMemo(() => `grad-${palette.name.replace(/\s+/g, "-").toLowerCase()}`, [palette.name]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200">
      <div className="rounded-xl border border-white/10 p-4" style={{ background }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="presentation"
          aria-label={`Preview of ${palette.name} shape`}
        >
          {fill === "gradient" && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                {palette.stops.map((stop, index) => (
                  <stop key={stop} offset={`${(index / (palette.stops.length - 1)) * 100}%`} stopColor={stop} />
                ))}
              </linearGradient>
            </defs>
          )}
          <path
            d={path}
            fill={fill === "gradient" ? `url(#${gradientId})` : fill === "solid" ? palette.stops[0] : "none"}
            stroke={outline ? "rgba(255,255,255,0.4)" : "none"}
            strokeWidth={outline ? 4 : 0}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
        <span>Variant: <strong className="text-white uppercase tracking-[0.3em]">{variantLabel(variant)}</strong></span>
        <span>Canvas: {width}×{height}px</span>
        <span>Seed: {seed}</span>
        <span>Complexity: {complexity}</span>
        <span>Amplitude: {amplitude.toFixed(2)}</span>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  description,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  description: string;
}) {
  return (
    <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-[0.35em] text-cyan-200/80">{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-cyan-400"
      />
      <span className="text-xs text-slate-400">{description}</span>
    </label>
  );
}

function ToggleField({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-slate-200 transition ${
        enabled ? "ring-1 ring-cyan-300/60" : ""
      }`}
    >
      <span className="uppercase tracking-[0.35em] text-cyan-200/80">{label}</span>
      <span
        className={`inline-flex h-6 w-11 items-center rounded-full border border-white/20 p-1 transition ${enabled ? "bg-cyan-400/80" : "bg-white/10"}`}
      >
        <span className={`h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

function buildExport({
  format,
  width,
  height,
  path,
  fill,
  palette,
  outline,
}: {
  format: ExportFormat;
  width: number;
  height: number;
  path: string;
  fill: string;
  palette: { name: string; stops: string[] };
  outline: boolean;
}): string {
  const gradientStops = palette.stops
    .map((stop, index) => `<stop offset="${(index / (palette.stops.length - 1)) * 100}%" stop-color="${stop}" />`)
    .join("\n        ");

  const gradientDef = fill === "gradient"
    ? `    <defs>
      <linearGradient id="shape-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        ${gradientStops}
      </linearGradient>
    </defs>
`
    : "";

  const fillValue = fill === "gradient" ? "url(#shape-gradient)" : fill === "solid" ? palette.stops[0] : "none";
  const strokeAttributes = outline ? ' stroke="rgba(255,255,255,0.4)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"' : "";

  const svgMarkup = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
${gradientDef}    <path d="${path}" fill="${fillValue}"${strokeAttributes} />
</svg>`;

  switch (format) {
    case "svg":
      return svgMarkup;
    case "html":
      return `<!-- ShapeSmith export -->\n<div class="shape-wrap">${svgMarkup}</div>`;
    case "jsx":
      return `export function Shape() {\n  return (\n    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">\n${indent(gradientDef, 6)}      <path d="${path}" fill="${fillValue}"${strokeAttributes.replace(/-([a-z])/g, (_, char) => char.toUpperCase())} />\n    </svg>\n  );\n}`;
    case "tsx":
      return `import type { SVGProps } from "react";\n\nexport function Shape(props: SVGProps<SVGSVGElement>) {\n  return (\n    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" {...props}>\n${indent(gradientDef, 6)}      <path d="${path}" fill="${fillValue}"${strokeAttributes.replace(/-([a-z])/g, (_, char) => char.toUpperCase())} />\n    </svg>\n  );\n}`;
    default:
      return svgMarkup;
  }
}

function indent(value: string, spaces: number): string {
  return value
    .split("\n")
    .filter(Boolean)
    .map((line) => `${" ".repeat(spaces)}${line}`)
    .join("\n")
    .concat("\n");
}

function variantLabel(variant: ShapeVariant): string {
  switch (variant) {
    case "blob":
      return "BLOB";
    case "wave":
      return "WAVE";
    case "zigzag":
      return "ZIGZAG";
    case "arch":
      return "ARCH";
    case "grid":
      return "GRID";
    case "star":
      return "STAR";
    case "petal":
      return "PETAL";
    default:
      return variant.toUpperCase();
  }
}

function clampNumber(value: string, min: number, max: number): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

