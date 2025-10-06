import { useEffect, useMemo, useRef, useState } from "react";
import { generateNoiseCanvas, generateNoiseDataUrl, generateNoiseBlob, type GenerateNoiseOptions, type NoiseVariant } from "../utils/noise";

type ExportFormat = "png" | "dataUrl" | "canvas";

const defaultOptions: GenerateNoiseOptions = {
  width: 512,
  height: 512,
  variant: "film",
  intensity: 0.7,
  alpha: 0.25,
  contrast: 0.1,
  scale: 2,
  seed: 1234,
  tint: "#ffffff",
  tintStrength: 0,
};

const variants: Array<{ label: string; value: NoiseVariant; description: string }> = [
  { label: "Film", value: "film", description: "Classic film grain with random luminance" },
  { label: "Grain", value: "grain", description: "Soft multi-sample grain with smoother specks" },
  { label: "Speckle", value: "speckle", description: "High contrast speckles for retro posters" },
  { label: "Dust", value: "dust", description: "Sparse dust specks for aged photography" },
  { label: "Scan lines", value: "lines", description: "Horizontal scan lines for CRT vibes" },
];

const exportFormats: Array<{ label: string; value: ExportFormat; description: string }> = [
  { label: "PNG", value: "png", description: "Download as transparent PNG" },
  { label: "Data URL", value: "dataUrl", description: "Copyable data URI string" },
  { label: "Canvas", value: "canvas", description: "Embed as <canvas> markup" },
];

export default function NoiseSmithPage() {
  const [options, setOptions] = useState<GenerateNoiseOptions>(defaultOptions);
  const [seed, setSeed] = useState(defaultOptions.seed);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [dataUrl, setDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const canvas = generateNoiseCanvas(options);
      const ctx = canvasRef.current?.getContext("2d");
      if (canvasRef.current && ctx) {
        canvasRef.current.width = canvas.width;
        canvasRef.current.height = canvas.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvas, 0, 0);
      }
      setDataUrl(canvas.toDataURL("image/png"));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to generate noise texture");
    }
  }, [options]);

  const codePreview = useMemo(() => {
    switch (exportFormat) {
      case "dataUrl":
        return dataUrl;
      case "canvas":
        return `const canvas = generateNoiseCanvas(${JSON.stringify(options, null, 2)});`;
      default:
        return `await generateNoiseBlob(${JSON.stringify(options, null, 2)});`;
    }
  }, [exportFormat, dataUrl, options]);

  async function handleDownload() {
    try {
      const blob = await generateNoiseBlob(options);
      const href = URL.createObjectURL(blob);
      downloadRef.current?.setAttribute("href", href);
      downloadRef.current?.setAttribute("download", `noise-${options.variant}-${options.width}x${options.height}.png`);
      downloadRef.current?.click();
      setTimeout(() => URL.revokeObjectURL(href), 500);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to download noise texture");
    }
  }

  function updateOption<K extends keyof GenerateNoiseOptions>(key: K, value: GenerateNoiseOptions[K]) {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }

  function randomiseSeed() {
    const next = Math.floor(Math.random() * 100000);
    setSeed(next);
    updateOption("seed", next);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">NoiseSmith</h1>
            <p className="text-sm text-slate-200/80">
              Generate subtle film grain, dust, and scan-line textures on the fly. Export ready-to-use PNGs, data URLs, or canvas code.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-200/70">
              <span className="uppercase tracking-[0.35em] text-cyan-200/80">Width</span>
              <input
                type="number"
                min={32}
                max={4096}
                value={options.width}
                onChange={(event) => updateOption("width", clampNumber(event.target.value, 32, 4096))}
                className="w-20 bg-transparent text-sm text-white outline-none"
              />
            </label>
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-200/70">
              <span className="uppercase tracking-[0.35em] text-cyan-200/80">Height</span>
              <input
                type="number"
                min={32}
                max={4096}
                value={options.height}
                onChange={(event) => updateOption("height", clampNumber(event.target.value, 32, 4096))}
                className="w-20 bg-transparent text-sm text-white outline-none"
              />
            </label>
            <button
              type="button"
              onClick={randomiseSeed}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20"
            >
              Shuffle seed
            </button>
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-200/70">
              <span className="uppercase tracking-[0.35em] text-cyan-200/80">Seed</span>
              <input
                type="number"
                value={seed}
                onChange={(event) => {
                  const value = clampNumber(event.target.value, 0, 999999);
                  setSeed(value);
                  updateOption("seed", value);
                }}
                className="w-24 bg-transparent text-sm text-white outline-none"
              />
            </label>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Variants</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {variants.map((variant) => (
                <button
                  key={variant.value}
                  type="button"
                  onClick={() => updateOption("variant", variant.value)}
                  className={`group rounded-2xl border px-4 py-3 text-left transition ${
                    options.variant === variant.value ? "border-cyan-400/60 bg-cyan-500/15 text-white" : "border-white/10 bg-white/5 text-slate-200/80 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{variant.label}</p>
                    {options.variant === variant.value && <span className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">Active</span>}
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{variant.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Adjustments</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <NoiseSlider label="Intensity" value={options.intensity} min={0} max={1} step={0.05} onChange={(value) => updateOption("intensity", value)} formatter={(value) => `${Math.round(value * 100)}%`} />
              <NoiseSlider label="Opacity" value={options.alpha} min={0} max={1} step={0.05} onChange={(value) => updateOption("alpha", value)} formatter={(value) => `${Math.round(value * 100)}%`} />
              <NoiseSlider label="Contrast" value={options.contrast} min={0} max={1} step={0.05} onChange={(value) => updateOption("contrast", value)} formatter={(value) => `${Math.round(value * 100)}%`} />
              <NoiseSlider label="Scale" value={options.scale} min={1} max={8} step={1} onChange={(value) => updateOption("scale", value)} suffix="x" />
              <NoiseSlider label="Tint strength" value={options.tintStrength} min={0} max={1} step={0.05} onChange={(value) => updateOption("tintStrength", value)} formatter={(value) => `${Math.round(value * 100)}%`} />
              <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
                <span className="uppercase tracking-[0.35em] text-cyan-200/80">Tint colour</span>
                <input
                  type="color"
                  value={rgbaToHex(options.tint)}
                  onChange={(event) => updateOption("tint", event.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-full border border-white/20"
                />
                <input
                  value={options.tint}
                  onChange={(event) => updateOption("tint", event.target.value)}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  placeholder="#FFFFFF"
                />
              </label>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20 backdrop-blur">
            <PreviewPanel canvasRef={canvasRef} dataUrl={dataUrl} options={options} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-teal-900/20 backdrop-blur">
            <ExportPanel
              exportFormat={exportFormat}
              onExportFormatChange={setExportFormat}
              codePreview={codePreview}
              onDownload={handleDownload}
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-xl shadow-blue-900/20">
            <h2 className="text-sm font-semibold text-white">Tips</h2>
            <ul className="mt-4 space-y-2">
              <li>• Combine NoiseSmith output with GradientSmith backgrounds for tactile surfaces.</li>
              <li>• Use tint strength to match brand colours while keeping subtle texture.</li>
              <li>• drop-shadow export pairs nicely with semi-transparent PNG overlays.</li>
              <li>• Scale above 2x to create crisp large textures resized in CSS.</li>
            </ul>
          </div>

          {error && (
            <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}
        </aside>
      </div>

      <a ref={downloadRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

function PreviewPanel({ canvasRef, dataUrl, options }: { canvasRef: React.RefObject<HTMLCanvasElement>; dataUrl: string; options: GenerateNoiseOptions }) {
  return (
    <div className="space-y-4 text-sm text-slate-200">
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-[0.35em] text-cyan-200/80">Preview</span>
        <span className="text-xs text-slate-400">{options.width}×{options.height}px • {options.variant}</span>
      </div>
      <div className="relative flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 p-6">
        <canvas ref={canvasRef} className="max-h-80 w-full max-w-full rounded-xl border border-white/10" />
      </div>
      <div className="space-y-1 text-xs text-slate-300">
        <p>Intensity {Math.round(options.intensity * 100)}% • Contrast {Math.round(options.contrast * 100)}% • Opacity {Math.round(options.alpha * 100)}%</p>
        <p>Scale {options.scale}× • Tint strength {Math.round(options.tintStrength * 100)}%</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-cyan-100">
        <p>Data URL length: {dataUrl.length.toLocaleString()} characters</p>
      </div>
    </div>
  );
}

function ExportPanel({
  exportFormat,
  onExportFormatChange,
  codePreview,
  onDownload,
}: {
  exportFormat: ExportFormat;
  onExportFormatChange: (format: ExportFormat) => void;
  codePreview: string;
  onDownload: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="uppercase tracking-[0.35em] text-cyan-200/80">Export</span>
        <div className="flex gap-2">
          {exportFormats.map((format) => (
            <button
              key={format.value}
              type="button"
              onClick={() => onExportFormatChange(format.value)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] transition ${
                exportFormat === format.value ? "border-cyan-400/60 bg-cyan-500/15 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {format.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-300">{exportFormats.find((format) => format.value === exportFormat)?.description}</p>
      <div className="h-64 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-cyan-100 shadow-inner shadow-cyan-500/10">
        <pre className="whitespace-pre-wrap">{codePreview}</pre>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
      >
        Download PNG
      </button>
    </div>
  );
}

function NoiseSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
  formatter,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  suffix?: string;
  formatter?: (value: number) => string;
}) {
  const display = formatter ? formatter(value) : `${value}${suffix ?? ""}`;
  return (
    <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-[0.35em] text-cyan-200/80">{label}</span>
        <span className="font-semibold text-white">{display}</span>
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
    </label>
  );
}

function clampNumber(value: string, min: number, max: number): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

function rgbaToHex(value: string): string {
  if (value.startsWith("#")) return value;
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/i);
  if (!match) return "#FFFFFF";
  const [, r, g, b] = match;
  const toHex = (channel: string) => Number(channel).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

