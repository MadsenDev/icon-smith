import { useMemo, useState } from "react";
import { buildGlassBackdrop, formatBoxShadow, formatCssFilter, formatTailwind, presets, type ShadowPresetKey, type ShadowStop } from "../utils/shadow";

type ExportMode = "css" | "tailwind" | "filters" | "glass";

type PanelState = {
  elevation: number;
  radius: number;
  background: string;
  text: string;
};

const exportModes: Array<{ label: string; value: ExportMode; description: string }> = [
  { label: "CSS box-shadow", value: "css", description: "Standard CSS box-shadow multi-layer stack." },
  { label: "Tailwind class", value: "tailwind", description: "Utility-ready string for Tailwind configs." },
  { label: "CSS drop-shadow", value: "filters", description: "drop-shadow filters for transparent SVG/PNG." },
  { label: "Glassmorphism", value: "glass", description: "Backdrop blur with frosted glass CSS." },
];

export default function ShadowSmithPage() {
  const [preset, setPreset] = useState<ShadowPresetKey>("soft");
  const [elevation, setElevation] = useState(36);
  const [radius, setRadius] = useState(28);
  const [background, setBackground] = useState("rgba(15,23,42,0.82)");
  const [text, setText] = useState("ShadowSmith");
  const [extraBlur, setExtraBlur] = useState(24);
  const [extraOpacity, setExtraOpacity] = useState(0.35);
  const [exportMode, setExportMode] = useState<ExportMode>("css");

  const selected = presets[preset];

  const panelState = useMemo<PanelState>(() => ({ elevation, radius, background, text }), [elevation, radius, background, text]);

  const shadowValue = useMemo(() => formatBoxShadow(selected.stops), [selected]);
  const tailwindValue = useMemo(() => formatTailwind(selected.stops), [selected]);
  const filterValue = useMemo(() => formatCssFilter(selected.stops), [selected]);
  const glassValue = useMemo(() => buildGlassBackdrop({ blur: extraBlur, transparency: extraOpacity }), [extraBlur, extraOpacity]);

  const exportValue = useMemo(() => {
    switch (exportMode) {
      case "tailwind":
        return tailwindValue;
      case "filters":
        return filterValue;
      case "glass":
        return glassValue;
      default:
        return shadowValue;
    }
  }, [exportMode, tailwindValue, filterValue, glassValue, shadowValue]);

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">ShadowSmith</h1>
            <p className="text-sm text-slate-200/80">
              Sculpt layered shadows, glassmorphism panels, and neon glows — export ready-made CSS, Tailwind utilities, or filter chains.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-200/70">
              <span className="uppercase tracking-[0.35em] text-cyan-200/80">Elevation</span>
              <input
                type="range"
                min={12}
                max={96}
                value={elevation}
                onChange={(event) => setElevation(Number(event.target.value))}
                className="w-32 accent-cyan-400"
              />
              <span className="font-semibold text-white">{elevation}px</span>
            </label>
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-200/70">
              <span className="uppercase tracking-[0.35em] text-cyan-200/80">Radius</span>
              <input
                type="range"
                min={0}
                max={64}
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
                className="w-32 accent-cyan-400"
              />
              <span className="font-semibold text-white">{radius}px</span>
            </label>
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-200/70">
              <span className="uppercase tracking-[0.35em] text-cyan-200/80">Panel copy</span>
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="w-40 bg-transparent text-sm text-white outline-none"
                placeholder="ShadowSmith"
              />
            </label>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Presets</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Object.values(presets).map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => setPreset(entry.key)}
                  className={`group rounded-2xl border px-4 py-3 text-left transition ${
                    preset === entry.key ? "border-cyan-400/60 bg-cyan-500/15 text-white" : "border-white/10 bg-white/5 text-slate-200/80 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{entry.label}</p>
                    {preset === entry.key && <span className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">Active</span>}
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{entry.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Fine tune</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ShadowSlider label="Extra blur" value={extraBlur} min={0} max={64} step={2} onChange={setExtraBlur} suffix="px" />
              <ShadowSlider label="Glass opacity" value={extraOpacity} min={0} max={0.9} step={0.05} onChange={setExtraOpacity} formatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
                <span className="uppercase tracking-[0.35em] text-cyan-200/80">Panel background</span>
                <input
                  type="color"
                  value={rgbaToHex(background)}
                  onChange={(event) => setBackground(event.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-full border border-white/20"
                />
                <input
                  value={background}
                  onChange={(event) => setBackground(event.target.value)}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  placeholder="rgba(15,23,42,0.82)"
                />
              </label>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20 backdrop-blur">
            <PreviewPanel preset={selected.key} state={panelState} stops={selected.stops} backgroundTexture={selected.background} extraBlur={extraBlur} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-teal-900/20 backdrop-blur">
            <ExportPanel
              exportMode={exportMode}
              onExportModeChange={setExportMode}
              exportValue={exportValue}
              modes={exportModes}
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-xl shadow-blue-900/20">
            <h2 className="text-sm font-semibold text-white">Usage tips</h2>
            <ul className="mt-4 space-y-2">
              <li>• Stack drop-shadow filters on transparent PNG/SVG logos for neon effects.</li>
              <li>• Pair glassmorphism CSS with GradientSmith and ShapeSmith to craft complex hero panels.</li>
              <li>• Tailwind export drops directly into your theme extend boxShadow map.</li>
              <li>• Duplicate presets to make bespoke design system tokens.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PreviewPanel({
  preset,
  state,
  stops,
  backgroundTexture,
  extraBlur,
}: {
  preset: ShadowPresetKey;
  state: PanelState;
  stops: ShadowStop[];
  backgroundTexture?: string;
  extraBlur: number;
}) {
  const { elevation, radius, background, text } = state;
  const shadowValue = formatBoxShadow(stops);

  return (
    <div className="space-y-4 text-sm text-slate-200">
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-[0.35em] text-cyan-200/80">Live preview</span>
        <span className="text-xs text-slate-400">Preset · {preset.toUpperCase()}</span>
      </div>
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 shadow-inner"
        style={{ backdropFilter: `blur(${extraBlur / 6}px)` }}
      >
        <div className="absolute inset-0 rounded-2xl opacity-70" style={{ background: backgroundTexture ?? "radial-gradient(circle at top, rgba(56,189,248,0.2), transparent)" }} />
        <div
          className="relative mx-auto flex h-48 w-full max-w-md flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 text-center"
          style={{
            boxShadow: shadowValue,
            borderRadius: `${radius}px`,
            background,
          }}
        >
          <span className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.35em] text-cyan-100">
            {preset}
          </span>
          <h3 className="text-xl font-semibold text-white drop-shadow-md">{text || "ShadowSmith"}</h3>
          <p className="text-xs text-slate-200/80">Elevation {elevation}px • Radius {radius}px</p>
        </div>
      </div>
      <code className="block rounded-2xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-cyan-100">
        {shadowValue}
      </code>
    </div>
  );
}

function ExportPanel({
  exportMode,
  onExportModeChange,
  exportValue,
  modes,
}: {
  exportMode: ExportMode;
  onExportModeChange: (mode: ExportMode) => void;
  exportValue: string;
  modes: typeof exportModes;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="uppercase tracking-[0.35em] text-cyan-200/80">Export</span>
        <div className="flex gap-2">
          {modes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => onExportModeChange(mode.value)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] transition ${
                exportMode === mode.value ? "border-cyan-400/60 bg-cyan-500/15 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-300">{modes.find((mode) => mode.value === exportMode)?.description}</p>
      <div className="h-64 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-cyan-100 shadow-inner shadow-cyan-500/10">
        <pre className="whitespace-pre-wrap">{exportValue}</pre>
      </div>
    </div>
  );
}

function ShadowSlider({
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

function rgbaToHex(value: string): string {
  if (value.startsWith("#")) return value;
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/i);
  if (!match) return "#0F172A";
  const [, r, g, b] = match;
  const toHex = (channel: string) => Number(channel).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
