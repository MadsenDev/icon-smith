import { useMemo, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { loadImageFromFile } from "../utils/image";

type Layout = "grid" | "horizontal" | "vertical";

type RuleTemplate = {
  id: string;
  label: string;
  description: string;
  transform: (input: string) => string;
};

type SpriteSource = {
  id: string;
  file: File;
  image: HTMLImageElement;
  width: number;
  height: number;
  baseName: string;
};

type SpritePlacement = {
  id: string;
  className: string;
  original: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type SpriteSheet = {
  canvas: HTMLCanvasElement;
  placements: SpritePlacement[];
};

const ruleTemplates: RuleTemplate[] = [
  {
    id: "kebab",
    label: "kebab-case",
    description: "lowercase with hyphens",
    transform: (input) =>
      input
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase(),
  },
  {
    id: "snake",
    label: "snake_case",
    description: "lowercase with underscores",
    transform: (input) =>
      input
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase(),
  },
  {
    id: "camel",
    label: "camelCase",
    description: "lowerCamelCase",
    transform: (input) => {
      const chunks = input
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((chunk) => chunk.toLowerCase());
      if (chunks.length === 0) return "";
      return chunks[0] + chunks.slice(1).map(capitalise).join("");
    },
  },
  {
    id: "pascal",
    label: "PascalCase",
    description: "UpperCamelCase",
    transform: (input) =>
      input
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((chunk) => capitalise(chunk.toLowerCase()))
        .join(""),
  },
];

export default function SpriteSmithPage() {
  const [sources, setSources] = useState<SpriteSource[]>([]);
  const [layout, setLayout] = useState<Layout>("grid");
  const [columns, setColumns] = useState(4);
  const [padding, setPadding] = useState(4);
  const [sheetName, setSheetName] = useState("sprite");
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");
  const [classRuleId, setClassRuleId] = useState(ruleTemplates[0].id);
  const [applyCaseRule, setApplyCaseRule] = useState(true);
  const [classPrefix, setClassPrefix] = useState("icon");
  const [classSuffix, setClassSuffix] = useState("");

  const activeRule = ruleTemplates.find((rule) => rule.id === classRuleId) ?? ruleTemplates[0];

  const sheet = useMemo<SpriteSheet | null>(() => {
    if (sources.length === 0) return null;
    return buildSpriteSheet({
      sources,
      layout,
      columns,
      padding,
      rule: activeRule,
      applyRule: applyCaseRule,
      prefix: classPrefix,
      suffix: classSuffix,
      background: backgroundColor,
    });
  }, [sources, layout, columns, padding, activeRule, applyCaseRule, classPrefix, classSuffix, backgroundColor]);

  const cssText = useMemo(() => (sheet ? buildCss(sheet.placements, `${sheetName}.png`) : ""), [sheet, sheetName]);
  const jsonText = useMemo(() => (sheet ? JSON.stringify(sheet.placements, null, 2) : ""), [sheet]);

  async function onSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    if (list.length === 0) return;
    const loaded = await Promise.all(
      list.map(async (file) => {
        const image = await loadImageFromFile(file);
        return {
          id: createId(),
          file,
          image,
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
          baseName: file.name.replace(/\.[^/.]+$/, ""),
        } satisfies SpriteSource;
      }),
    );

    setSources((prev) => [...prev, ...loaded]);
    e.target.value = "";
  }

  function removeSprite(id: string) {
    setSources((prev) => prev.filter((sprite) => sprite.id !== id));
  }

  function clearSprites() {
    setSources([]);
  }

  function copy(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
  }

  async function downloadPng() {
    if (!sheet) return;
    const blob = await canvasToBlob(sheet.canvas);
    if (!blob) return;
    saveAs(blob, `${sheetName || "sprite"}.png`);
  }

  async function downloadBundle() {
    if (!sheet) return;
    const zip = new JSZip();
    const imageBlob = await canvasToBlob(sheet.canvas);
    if (!imageBlob) return;
    const base = sheetName || "sprite";
    zip.file(`${base}.png`, imageBlob);
    zip.file(`${base}.css`, cssText);
    zip.file(`${base}.json`, jsonText);
    const out = await zip.generateAsync({ type: "blob" });
    saveAs(out, `${base}-bundle.zip`);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">SpriteSmith</h1>
            <p className="text-sm text-slate-200/80">
              Upload icons, arrange them into a sprite sheet, and export the PNG alongside CSS and JSON metadata.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <label className="group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500/80 via-blue-500/80 to-purple-500/80 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
              <span className="z-10">{sources.length ? `${sources.length} images` : "Select images"}</span>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition group-hover:opacity-100" />
              <input type="file" accept="image/*" multiple className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={onSelectFiles} />
            </label>
            <button
              type="button"
              onClick={downloadPng}
              disabled={!sheet}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
            >
              Download PNG
            </button>
            <button
              type="button"
              onClick={downloadBundle}
              disabled={!sheet}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
            >
              Download bundle
            </button>
            <button
              type="button"
              onClick={clearSprites}
              disabled={sources.length === 0}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <section className="grid flex-1 gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Layout</h2>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {layoutOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.35em] transition ${
                      layout === option.value
                        ? "border-cyan-300 bg-cyan-500/30 text-white"
                        : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                    }`}
                    onClick={() => setLayout(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {layout === "grid" && (
                <label className="block space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                  Columns
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={columns}
                    onChange={(e) => setColumns(parseInt(e.target.value, 10) || 1)}
                    className="mt-2 h-2 w-full cursor-pointer accent-cyan-400"
                  />
                  <span className="text-sm text-slate-200/70">{columns} column{columns === 1 ? "" : "s"}</span>
                </label>
              )}

              <label className="block space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                Padding ({padding}px)
                <input
                  type="range"
                  min={0}
                  max={64}
                  value={padding}
                  onChange={(e) => setPadding(parseInt(e.target.value, 10) || 0)}
                  className="mt-2 h-2 w-full cursor-pointer accent-cyan-400"
                />
              </label>

              <div className="space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                Background
                <div className="flex flex-wrap gap-2 text-xs normal-case tracking-normal">
                  <button
                    type="button"
                    className={`rounded-full border px-4 py-2 transition ${
                      backgroundColor === "transparent"
                        ? "border-cyan-300 bg-cyan-500/30 text-white"
                        : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                    }`}
                    onClick={() => setBackgroundColor("transparent")}
                  >
                    Transparent
                  </button>
                  <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-slate-200/80 transition hover:border-cyan-300/60">
                    <span>Custom</span>
                    <input
                      type="color"
                      value={backgroundColor === "transparent" ? "#000000" : backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-6 w-10 cursor-pointer border-none bg-transparent"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-purple-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Class names</h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {ruleTemplates.map((rule) => (
                  <button
                    key={rule.id}
                    type="button"
                    className={`rounded-2xl border px-4 py-3 text-left text-xs transition ${
                      classRuleId === rule.id ? "border-cyan-300 bg-cyan-500/30 text-white" : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                    }`}
                    onClick={() => setClassRuleId(rule.id)}
                  >
                    <span className="font-semibold">{rule.label}</span>
                    <span className="mt-1 block text-[11px] text-slate-200/70">{rule.description}</span>
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-200/80">
                <input
                  type="checkbox"
                  checked={applyCaseRule}
                  onChange={(e) => setApplyCaseRule(e.target.checked)}
                  className="h-4 w-4"
                />
                Apply case rule (disable to keep original names)
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Prefix</span>
                <input
                  value={classPrefix}
                  onChange={(e) => setClassPrefix(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Suffix</span>
                <input
                  value={classSuffix}
                  onChange={(e) => setClassSuffix(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Sheet name</span>
                <input
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase())}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Sprites</h2>
            {sources.length === 0 ? (
              <p className="mt-4 text-sm text-slate-200/70">No sprites yet. Upload some images.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {sources.map((sprite) => (
                  <li key={sprite.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-slate-200/80">
                    <span>{sprite.file.name}</span>
                    <div className="flex items-center gap-3 text-[11px] text-slate-300/80">
                      <span>{sprite.width}×{sprite.height}</span>
                      <button
                        type="button"
                        onClick={() => removeSprite(sprite.id)}
                        className="rounded-full border border-white/10 bg-white/10 px-3 py-1 uppercase tracking-[0.35em] text-white transition hover:bg-white/20"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Preview</h2>
            {sheet ? (
              <div className="mt-4 space-y-4">
                <img
                  src={sheet.canvas.toDataURL("image/png")}
                  alt="Sprite sheet preview"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 p-4"
                />
                <div className="overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-slate-100 shadow-inner shadow-black/40">
                  <table className="w-full border-separate border-spacing-y-2">
                    <thead className="text-xs uppercase tracking-[0.35em] text-slate-300/80">
                      <tr>
                        <th className="text-left">Class</th>
                        <th className="text-left">X</th>
                        <th className="text-left">Y</th>
                        <th className="text-left">W</th>
                        <th className="text-left">H</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheet.placements.map((placement) => (
                        <tr key={placement.id} className="text-xs text-slate-100">
                          <td className="rounded-l-xl bg-white/5 px-4 py-2 font-mono text-[12px] text-cyan-100">.{placement.className}</td>
                          <td className="bg-white/10 px-4 py-2">{placement.x}</td>
                          <td className="bg-white/10 px-4 py-2">{placement.y}</td>
                          <td className="bg-white/10 px-4 py-2">{placement.width}</td>
                          <td className="rounded-r-xl bg-white/10 px-4 py-2">{placement.height}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-200/70">Upload sprites to see a preview.</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">CSS</h2>
              <button
                type="button"
                onClick={() => copy(cssText)}
                disabled={!cssText}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                Copy
              </button>
            </div>
            <pre className="mt-4 h-48 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] text-cyan-100 shadow-inner shadow-cyan-900/30">{cssText}</pre>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">JSON</h2>
              <button
                type="button"
                onClick={() => copy(jsonText)}
                disabled={!jsonText}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                Copy
              </button>
            </div>
            <pre className="mt-4 h-48 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] text-cyan-100 shadow-inner shadow-cyan-900/30">{jsonText}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}

function buildSpriteSheet(args: {
  sources: SpriteSource[];
  layout: Layout;
  columns: number;
  padding: number;
  rule: RuleTemplate;
  applyRule: boolean;
  prefix: string;
  suffix: string;
  background: string;
}): SpriteSheet {
  const { sources, layout, columns, padding, rule, applyRule, prefix, suffix, background } = args;
  const placements: SpritePlacement[] = [];
  const nameCounts = new Map<string, number>();

  const sanitized = sources.map((source, index) => {
    const base = source.baseName;
    let name = applyRule ? rule.transform(base) : base;
    name = name.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
    name = name || `sprite-${index + 1}`;
    if (/^[0-9]/.test(name)) {
      name = `s-${name}`;
    }
    if (prefix) name = `${prefix}-${name}`;
    if (suffix) name = `${name}-${suffix}`;
    name = name.replace(/--+/g, "-").replace(/^-+|-+$/g, "");
    const count = nameCounts.get(name) ?? 0;
    nameCounts.set(name, count + 1);
    if (count > 0) name = `${name}-${count + 1}`;
    return {
      id: source.id,
      className: name,
      original: source.file.name,
      width: source.width,
      height: source.height,
      image: source.image,
    };
  });

  const layoutResult = computeLayout(sanitized, layout, columns, padding);
  const canvas = document.createElement("canvas");
  canvas.width = layoutResult.width;
  canvas.height = layoutResult.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to get canvas context");

  if (background !== "transparent") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  layoutResult.items.forEach((item) => {
    ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
    placements.push({
      id: item.id,
      className: item.className,
      original: item.original,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
    });
  });

  return { canvas, placements };
}

function computeLayout(
  items: Array<{
    id: string;
    className: string;
    original: string;
    width: number;
    height: number;
    image: HTMLImageElement;
  }>,
  layout: Layout,
  columns: number,
  padding: number,
) {
  if (layout === "horizontal") {
    let x = padding;
    let maxHeight = 0;
    const placements = items.map((item) => {
      const placement = { ...item, x, y: padding };
      x += item.width + padding;
      maxHeight = Math.max(maxHeight, item.height);
      return placement;
    });
    const width = Math.max(padding * 2, x);
    const height = maxHeight + padding * 2;
    return { width, height, items: placements };
  }

  if (layout === "vertical") {
    let y = padding;
    let maxWidth = 0;
    const placements = items.map((item) => {
      const placement = { ...item, x: padding, y };
      y += item.height + padding;
      maxWidth = Math.max(maxWidth, item.width);
      return placement;
    });
    const width = maxWidth + padding * 2;
    const height = Math.max(padding * 2, y);
    return { width, height, items: placements };
  }

  const cols = Math.max(1, Math.min(columns, items.length));
  const rows = Math.ceil(items.length / cols);
  const colWidths = new Array(cols).fill(0);
  const rowHeights = new Array(rows).fill(0);

  items.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    colWidths[col] = Math.max(colWidths[col], item.width);
    rowHeights[row] = Math.max(rowHeights[row], item.height);
  });

  const xPositions: number[] = [];
  let currentX = padding;
  colWidths.forEach((width) => {
    xPositions.push(currentX);
    currentX += width + padding;
  });

  const yPositions: number[] = [];
  let currentY = padding;
  rowHeights.forEach((height) => {
    yPositions.push(currentY);
    currentY += height + padding;
  });

  const placements = items.map((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      ...item,
      x: xPositions[col],
      y: yPositions[row],
    };
  });

  const width = padding + colWidths.reduce((sum, w) => sum + w + padding, 0);
  const height = padding + rowHeights.reduce((sum, h) => sum + h + padding, 0);
  return { width, height, items: placements };
}

function buildCss(placements: SpritePlacement[], imagePath: string) {
  const baseClass = `.sprite-smith {
  background-image: url("${imagePath}");
  background-repeat: no-repeat;
  display: inline-block;
}
`; 
  const rules = placements
    .map(
      (sprite) => `.${sprite.className} {
  width: ${sprite.width}px;
  height: ${sprite.height}px;
  background-position: -${sprite.x}px -${sprite.y}px;
}`,
    )
    .join("\n\n");
  return `${baseClass}\n${rules}`;
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

const layoutOptions: { value: Layout; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
];
