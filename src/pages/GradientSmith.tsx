import { useMemo, useState } from "react";

function createStopId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

const defaultStops = [
  { id: createStopId(), color: "#4F46E5", position: 0 },
  { id: createStopId(), color: "#22D3EE", position: 50 },
  { id: createStopId(), color: "#F97316", position: 100 },
];

type GradientKind = "linear" | "radial" | "conic";

type GradientCenter = { x: number; y: number };

type Stop = {
  id: string;
  color: string;
  position: number;
};

type GradientMeta = {
  gradient: string;
  kind: GradientKind;
  angle: number;
  center: GradientCenter;
  stops: Stop[];
};

const formatConfigs = {
  css: {
    label: "CSS",
    convert: ({ gradient }: GradientMeta) => `background: ${gradient};`,
  },
  tailwind: {
    label: "Tailwind",
    convert: ({ gradient }: GradientMeta) => `background-image: ${gradient};`,
  },
  svg: {
    label: "SVG",
    convert: ({ gradient, kind }: GradientMeta) => (kind === "linear" ? svgTemplate(gradient) : svgUnsupported(kind)),
    note: ({ kind }: GradientMeta) => (kind === "linear" ? null : "SVG export currently supports linear gradients only."),
  },
} satisfies Record<string, { label: string; convert: (meta: GradientMeta) => string; note?: (meta: GradientMeta) => string | null }>;

type FormatKey = keyof typeof formatConfigs;

const gradientTypes: Array<{ key: GradientKind; label: string; description: string }> = [
  { key: "linear", label: "Linear", description: "Classic directional blend." },
  { key: "radial", label: "Radial", description: "Radiates from a focal point." },
  { key: "conic", label: "Conic", description: "Sweeps around a center like a pie chart." },
];

function randomHex() {
  const value = Math.floor(Math.random() * 0xffffff);
  return `#${value.toString(16).padStart(6, "0")}`.toUpperCase();
}

function distributePositions(count: number) {
  if (count <= 1) return [0];
  const step = 100 / (count - 1);
  return Array.from({ length: count }, (_, index) => Math.round(index * step));
}

export default function GradientSmithPage() {
  const [kind, setKind] = useState<GradientKind>("linear");
  const [angle, setAngle] = useState(135);
  const [center, setCenter] = useState<GradientCenter>({ x: 50, y: 50 });
  const [stops, setStops] = useState<Stop[]>(defaultStops);
  const [format, setFormat] = useState<FormatKey>("css");

  const gradient = useMemo(() => buildGradient(kind, angle, center, stops), [kind, angle, center, stops]);
  const meta = useMemo(() => ({ gradient, kind, angle, center, stops }), [gradient, kind, angle, center, stops]);
  const output = formatConfigs[format].convert(meta);
  const formatNote = formatConfigs[format].note?.(meta) ?? null;
  const activeType = gradientTypes.find((option) => option.key === kind);

  function addStop() {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const next = Math.min(100, Math.round((sorted[sorted.length - 1]?.position ?? 0) + 20));
    setStops((prev) => [...prev, { id: createStopId(), color: "#ffffff", position: next }].sort((a, b) => a.position - b.position));
  }

  function updateStop(id: string, changes: Partial<Stop>) {
    setStops((prev) =>
      prev
        .map((stop) =>
          stop.id === id
            ? {
                ...stop,
                ...changes,
                position:
                  changes.position !== undefined
                    ? Math.min(100, Math.max(0, Math.round(changes.position)))
                    : stop.position,
              }
            : stop,
        )
        .sort((a, b) => a.position - b.position),
    );
  }

  function removeStop(id: string) {
    if (stops.length <= 2) return; // keep at least two stops
    setStops((prev) => prev.filter((stop) => stop.id !== id));
  }

  function reverseStops() {
    setStops((prev) => {
      const sorted = [...prev].sort((a, b) => a.position - b.position);
      const reversed = sorted.map((stop, index) => {
        const source = sorted[sorted.length - 1 - index];
        return { ...stop, color: source.color, position: 100 - source.position };
      });
      return reversed.sort((a, b) => a.position - b.position);
    });
  }

  function distributeStops() {
    setStops((prev) => {
      if (prev.length <= 1) return prev;
      const sorted = [...prev].sort((a, b) => a.position - b.position);
      const positions = distributePositions(sorted.length);
      return sorted.map((stop, index) => ({ ...stop, position: positions[index] }));
    });
  }

  function randomizeStops() {
    setStops(() => {
      const count = Math.floor(Math.random() * 4) + 3; // 3-6 stops
      const positions = distributePositions(count);
      return positions.map((position) => ({ id: createStopId(), color: randomHex(), position }));
    });
  }

  function updateCenter(axis: "x" | "y", value: number) {
    setCenter((prev) => ({ ...prev, [axis]: Math.min(100, Math.max(0, Math.round(value))) }));
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">GradientSmith</h1>
            <p className="text-sm text-slate-200/80">
              Craft multi-stop gradients, tweak angles, preview on mock devices, and export CSS, Tailwind, or SVG snippets.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {(Object.entries(formatConfigs) as [FormatKey, (typeof formatConfigs)[FormatKey]][]).map(([key, value]) => (
              <button
                key={key}
                type="button"
                className={`rounded-full border px-4 py-2 uppercase tracking-[0.35em] transition ${
                  format === key ? "border-cyan-300 bg-cyan-500/30 text-white" : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                }`}
                onClick={() => setFormat(key)}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="grid flex-1 gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Type</span>
            <div className="flex flex-wrap gap-2">
              {gradientTypes.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setKind(type.key)}
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.35em] transition ${kind === type.key ? "border-cyan-300 bg-cyan-500/30 text-white" : "border-white/10 bg-white/10 text-slate-200 hover:bg-white/20"}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {activeType && <p className="text-[11px] text-slate-400">{activeType.description}</p>}
          </div>

          {(kind === "linear" || kind === "conic") && (
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                {kind === "conic" ? `Start angle (${angle}°)` : `Angle (${angle}°)`}
              </span>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                className="h-2 w-full cursor-pointer accent-cyan-400"
              />
            </label>
          )}

          {kind === "radial" && (
            <p className="rounded-2xl border border-white/10 bg-black/30 p-3 text-[11px] text-slate-300">
              Radial gradients ignore angle; adjust the center controls below to move the hotspot.
            </p>
          )}

          {kind !== "linear" && (
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Center X ({center.x}%)</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={center.x}
                  onChange={(e) => updateCenter("x", parseInt(e.target.value, 10))}
                  className="h-2 w-full cursor-pointer accent-cyan-400"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Center Y ({center.y}%)</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={center.y}
                  onChange={(e) => updateCenter("y", parseInt(e.target.value, 10))}
                  className="h-2 w-full cursor-pointer accent-cyan-400"
                />
              </label>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Stops</p>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white transition hover:bg-white/20"
                onClick={addStop}
              >
                Add stop
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.35em] text-slate-300">
              <button
                type="button"
                onClick={reverseStops}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 transition hover:bg-white/20 disabled:opacity-40"
                disabled={stops.length <= 2}
              >
                Reverse
              </button>
              <button
                type="button"
                onClick={distributeStops}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 transition hover:bg-white/20 disabled:opacity-40"
                disabled={stops.length <= 2}
              >
                Even spacing
              </button>
              <button
                type="button"
                onClick={randomizeStops}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 transition hover:bg-white/20"
              >
                Shuffle palette
              </button>
            </div>
            <div className="space-y-2">
              {stops.map((stop) => (
                <div key={stop.id} className="space-y-2 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs text-slate-200/80">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                      className="h-9 w-14 cursor-pointer rounded-xl border border-white/10"
                    />
                    <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">
                      <span>Pos</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={stop.position}
                        onChange={(e) => updateStop(stop.id, { position: parseInt(e.target.value, 10) || 0 })}
                        className="w-16 rounded-xl border border-white/10 bg-white/10 px-2 py-1 text-xs text-white focus:border-cyan-300 focus:outline-none"
                      />
                    </label>
                    <span className="text-[11px] uppercase tracking-[0.35em] text-slate-300">%</span>
                    <button
                      type="button"
                      onClick={() => removeStop(stop.id)}
                      className="ml-auto rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white transition hover:bg-white/20 disabled:opacity-50"
                      disabled={stops.length <= 2}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => updateStop(stop.id, { position: parseInt(e.target.value, 10) })}
                    className="h-2 w-full cursor-pointer accent-cyan-400"
                    aria-label={`Position for stop ${stop.color}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
            <p className="font-semibold text-white">{formatConfigs[format].label} output</p>
            <pre className="mt-2 h-40 overflow-auto rounded-xl bg-black/40 p-3 font-mono text-[11px] text-cyan-100 shadow-inner shadow-black/40">{output}</pre>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white transition hover:bg-white/20"
                onClick={() => navigator.clipboard.writeText(output)}
              >
                Copy
              </button>
              {formatNote && <span className="text-[11px] text-amber-200/80">{formatNote}</span>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Preview</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
                <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">Gradient</p>
                <div className="mt-2 h-48 rounded-xl border border-white/10" style={{ background: gradient }} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
                <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">Landing hero</p>
                <div className="mt-2 flex h-48 flex-col justify-between rounded-xl border border-white/10 p-6 text-white" style={{ background: gradient }}>
                  <span className="rounded-full bg-white/15 px-4 py-1 text-[10px] uppercase tracking-[0.35em]">GradientSmith</span>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold">Craft gradients in seconds</p>
                    <p className="text-sm text-white/80">Perfect for hero backgrounds, OG cards, and design tokens.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
                <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">Device</p>
                <div className="mt-2 flex h-48 items-center justify-center rounded-xl border border-white/10 bg-black/60 p-4">
                  <div className="h-full w-32 rounded-3xl border border-white/10" style={{ background: gradient }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function buildGradient(kind: GradientKind, angle: number, center: GradientCenter, stops: Stop[]): string {
  const stopString = [...stops]
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ");

  switch (kind) {
    case "radial":
      return `radial-gradient(circle at ${center.x}% ${center.y}%, ${stopString})`;
    case "conic":
      return `conic-gradient(from ${angle}deg at ${center.x}% ${center.y}%, ${stopString})`;
    case "linear":
    default:
      return `linear-gradient(${angle}deg, ${stopString})`;
  }
}

function svgTemplate(gradient: string) {
  const match = gradient.match(/linear-gradient\(([^)]+)\)/);
  if (!match) return "";
  const [angleRaw, ...stopParts] = match[1].split(/,(.+)/).filter(Boolean);
  const angleDeg = parseFloat(angleRaw);
  const coords = angleToSvg(angleDeg);
  const stops = stopParts
    .join(",")
    .split(",")
    .map((part) => part.trim())
    .map((value, index) => {
      const [color, position] = value.split(/\s+/);
      return `<stop offset="${position ?? index * (100 / (stopParts.length - 1))}%" stop-color="${color}" />`;
    })
    .join("\n        ");

  return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}">
        ${stops}
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#gradient)" />
</svg>`;
}

function svgUnsupported(kind: GradientKind) {
  return `<!-- ${kind} gradients are not yet supported for SVG export -->`;
}

function angleToSvg(angle: number) {
  const rad = ((angle % 360) * Math.PI) / 180;
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  const x1 = (1 - x) / 2;
  const y1 = (1 - y) / 2;
  const x2 = (1 + x) / 2;
  const y2 = (1 + y) / 2;
  return { x1: x1.toFixed(3), y1: y1.toFixed(3), x2: x2.toFixed(3), y2: y2.toFixed(3) };
}
