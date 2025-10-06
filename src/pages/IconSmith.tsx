import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Presets, type PresetKey } from "../presets";
import {
  loadImageFromFile,
  renderToCanvas,
  canvasToPNGBlob,
  toMonochromeWhite,
} from "../utils/image";
import { encodeICO, type IconSource } from "../utils/ico";

const presetEntries = Object.entries(Presets) as [
  PresetKey,
  (typeof Presets)[PresetKey]
][];
const totalPresets = presetEntries.length;
const largestTargetSize = Math.max(
  ...presetEntries.flatMap(([, preset]) => preset.tasks.map((t) => t.size)),
);

type QualityHintSeverity = "info" | "warning" | "positive";

type QualityHint = {
  id: string;
  severity: QualityHintSeverity;
  title: string;
  detail: string;
};

const severityStyles: Record<QualityHintSeverity, string> = {
  info: "from-sky-500/20 via-blue-500/20 to-indigo-500/20 border-sky-400/40",
  warning: "from-amber-500/25 via-orange-500/20 to-rose-500/20 border-amber-400/40",
  positive: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-400/40",
};

type OverlayShape = {
  id: string;
  label: string;
  description: string;
  borderRadius: string;
};

const overlayShapes: OverlayShape[] = [
  {
    id: "circle",
    label: "Circle",
    description: "Maskable icons, Android adaptive foregrounds.",
    borderRadius: "50%",
  },
  {
    id: "rounded",
    label: "Rounded",
    description: "Windows tiles and desktop launchers.",
    borderRadius: "25%",
  },
  {
    id: "squircle",
    label: "Squircle",
    description: "iOS home screen footprint.",
    borderRadius: "38%",
  },
];

export default function IconSmithPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [selected, setSelected] = useState<Record<PresetKey, boolean>>({
    web: true,
    android: true,
    ios: true,
    windows: true,
    desktop: true,
  });
  const [padPct, setPadPct] = useState(0);
  const [busy, setBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [qualityHints, setQualityHints] = useState<QualityHint[]>([]);
  const [baseQualityHints, setBaseQualityHints] = useState<QualityHint[]>([]);
  const [shapeOverlay, setShapeOverlay] = useState<string | null>("circle");
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const ready = !!imgEl;
  const selectedCount = useMemo(
    () => (Object.values(selected) as boolean[]).filter(Boolean).length,
    [selected],
  );
  const padPercentage = Math.round(padPct * 100);
  const fileLabel = file?.name ?? "No file selected yet";
  const originalDimensions = imgEl
    ? `${imgEl.naturalWidth} × ${imgEl.naturalHeight}`
    : null;

  const evaluateQuality = useCallback((image: HTMLImageElement, source?: File) => {
    const hints: QualityHint[] = [];
    const { naturalWidth: width, naturalHeight: height } = image;
    const minSide = Math.min(width, height);
    const aspectRatio = width / height;

    if (minSide < largestTargetSize) {
      hints.push({
        id: "resolution",
        severity: "warning",
        title: "Source image is smaller than the largest export",
        detail: `Largest preset needs ${largestTargetSize}px — your shortest side is ${minSide}px. Upscaling may soften details.`,
      });
    } else if (minSide >= largestTargetSize * 1.4) {
      hints.push({
        id: "resolution-positive",
        severity: "positive",
        title: "Plenty of resolution headroom",
        detail: "The artwork comfortably covers every target size. Expect crisp exports.",
      });
    }

    if (Math.abs(1 - aspectRatio) > 0.15) {
      const ratioLabel = aspectRatio > 1 ? "wide" : "tall";
      hints.push({
        id: "aspect-ratio",
        severity: "info",
        title: "Artwork isn’t square",
        detail: `The image is fairly ${ratioLabel}. Consider using a square artboard to avoid extra padding in some outputs.`,
      });
    }

    const transparentRatio = measureAlphaCoverage(image);
    if (transparentRatio < 0.01) {
      hints.push({
        id: "alpha",
        severity: "info",
        title: "Opaque background detected",
        detail: "Most pixels are fully opaque. Trim any solid background if you want rounded or maskable variants to breathe.",
      });
    } else if (transparentRatio > 0.5) {
      hints.push({
        id: "alpha-positive",
        severity: "positive",
        title: "Strong transparency coverage",
        detail: "Transparent regions will translate nicely into adaptive, maskable, and favicon outputs.",
      });
    }

    if (source?.type?.includes("svg")) {
      hints.push({
        id: "svg",
        severity: "positive",
        title: "Vector input detected",
        detail: "SVG sources stay razor sharp at every size and avoid PNG compression artifacts.",
      });
    }

    setBaseQualityHints(hints);
  }, []);

  useEffect(() => {
    const hints = [...baseQualityHints];

    if (imgEl) {
      if (padPct > 0.18) {
        hints.push({
          id: "padding-high",
          severity: "info",
          title: "Generous padding applied",
          detail: "High padding keeps icons airy, but double-check small sizes so key details remain legible.",
        });
      } else if (padPct < 0.02) {
        hints.push({
          id: "padding-low",
          severity: "info",
          title: "Minimal padding",
          detail: "Tight padding maximises imprint area. Ensure no edges clip when exported as rounded shapes.",
        });
      }
    }

    setQualityHints(hints);
  }, [baseQualityHints, imgEl, padPct]);

  async function applyFile(f: File | null | undefined) {
    if (!f) return;
    setFile(f);
    const img = await loadImageFromFile(f);
    setImgEl(img);
    evaluateQuality(img, f);
  }

  async function handleFileList(list: FileList | null) {
    if (!list || list.length === 0) return;
    await applyFile(list[0]);
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    await handleFileList(e.target.files);
    e.target.value = "";
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setIsDragging(false);
    await handleFileList(e.dataTransfer?.files ?? null);
  };

  function measureAlphaCoverage(image: HTMLImageElement): number {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 32) {
        transparent += 1;
      }
    }
    return transparent / total;
  }

  async function buildZip() {
    if (!imgEl) return;
    setBusy(true);
    try {
      const zip = new JSZip();
      const chosen = (Object.keys(selected) as PresetKey[]).filter(
        (k) => selected[k],
      );

      for (const key of chosen) {
        const preset = Presets[key];
        const generatedBlobs = new Map<string, Blob>();

        for (const t of preset.tasks) {
          const localPad = t.padPct ?? padPct;
          let canvas = renderToCanvas(imgEl, t.size, localPad);
          if (t.monochrome) canvas = toMonochromeWhite(canvas);
          const blob = await canvasToPNGBlob(canvas);
          zip.file(t.path, blob);
          generatedBlobs.set(t.path, blob);
        }

        if (preset.extras) {
          for (const [path, content] of preset.extras) {
            zip.file(path, content);
          }
        }

        if (key === "web") {
          const favPaths = [
            "web/favicon-16.png",
            "web/favicon-32.png",
            "web/favicon-48.png",
          ];
          const favPngs: IconSource[] = favPaths
            .map((p) => {
              const blob = generatedBlobs.get(p);
              const size = parseInt(p.match(/(\d+)/)?.[0] ?? "0", 10);
              if (!blob || !size) return null;
              return { size, blob };
            })
            .filter((entry): entry is IconSource => Boolean(entry));
          if (favPngs.length === favPaths.length) {
            const icoBuf = await encodeICO(favPngs);
            zip.file("web/favicon.ico", icoBuf);
            for (const p of favPaths) {
              zip.remove(p);
            }
          }
          zip.file(
            "web/manifest-snippet.json",
            JSON.stringify(
              {
                icons: [
                  {
                    src: "/icons/web/icon-192.png",
                    sizes: "192x192",
                    type: "image/png",
                  },
                  {
                    src: "/icons/web/icon-512.png",
                    sizes: "512x512",
                    type: "image/png",
                  },
                  {
                    src: "/icons/web/icon-192-maskable.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "maskable",
                  },
                  {
                    src: "/icons/web/icon-512-maskable.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "maskable",
                  },
                ],
              },
              null,
              2,
            ),
          );
        }

        if (key === "windows") {
          const sizes = [16, 24, 32, 48, 64, 128, 256];
          const pngs: IconSource[] = sizes
            .map((s) => {
              const blob = generatedBlobs.get(`windows/ico-${s}.png`);
              if (!blob) return null;
              return { size: s, blob };
            })
            .filter((entry): entry is IconSource => Boolean(entry));
          if (pngs.length === sizes.length) {
            const ico = await encodeICO(pngs);
            zip.file("windows/app.ico", ico);
          }
        }
      }

      const name = file?.name?.replace(/\.\w+$/, "") || "icon";
      const out = await zip.generateAsync({ type: "blob" });
      saveAs(out, `${name}-icons.zip`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-200/40 via-transparent to-transparent blur-3xl dark:from-teal-500/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-purple-300/30 via-transparent to-transparent blur-3xl dark:from-purple-600/30" />
      <div className="relative z-10 flex h-screen flex-col px-6 py-8 lg:px-14">
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-slate-100/80 backdrop-blur dark:bg-slate-950/70">
            <div className="rounded-3xl border border-cyan-400/60 bg-white px-10 py-8 text-center text-slate-900 shadow-[0_25px_80px_-40px_rgba(103,232,249,0.4)] dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-[0_25px_80px_-40px_rgba(34,211,238,0.6)]">
              <p className="text-lg font-semibold">Drop your SVG or PNG</p>
              <p className="mt-2 text-sm text-cyan-600 dark:text-cyan-200/80">We&apos;ll process it instantly in your browser.</p>
            </div>
          </div>
        )}

        <main className="mt-6 flex flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
          <div className="flex flex-[1.7] flex-col gap-4 overflow-hidden">
            <section className="flex flex-1 min-h-0 flex-col rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl shadow-teal-200/40 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-teal-900/20">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-0.5">
                  <h1 className="text-base font-semibold text-slate-900 dark:text-white">Source Artwork</h1>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    SVG or transparent PNG recommended. High resolution gives crisp results.
                  </p>
                </div>
                <label className="group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500/80 via-blue-500/80 to-purple-500/80 px-4 py-1.5 text-[11px] font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:px-4 sm:text-xs">
                  <span className="z-10 truncate max-w-[170px] text-left sm:max-w-[210px]">{fileLabel}</span>
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition group-hover:opacity-100" />
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,.svg"
                    onChange={onPick}
                    className="absolute inset-0 h-full w-full opacity-0"
                  />
                </label>
              </div>

              {imgEl ? (
                <div className="mt-4 flex flex-1 min-h-0 gap-4">
                  <div className="flex w-[220px] flex-col gap-3">
                    <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-100 p-3 shadow-inner shadow-cyan-200/30 dark:border-white/10 dark:bg-slate-950/60 dark:shadow-cyan-500/10">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-200/70">
                        <span>Preview</span>
                        <span className="text-[9px] font-normal tracking-[0.2em] text-slate-500 dark:text-slate-300">
                          Alpha intact
                        </span>
                      </div>
                      <div className="mt-3 flex flex-1 items-center justify-center">
                        <Preview img={imgEl} size={176} padPct={padPct} shapeOverlay={shapeOverlay} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 dark:text-slate-200 sm:text-xs">
                      {overlayShapes.map((shape) => (
                        <button
                          key={shape.id}
                          type="button"
                          onClick={() => setShapeOverlay(shape.id)}
                          className={`flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 p-2 text-center transition hover:border-cyan-400/60 dark:border-white/10 dark:bg-white/5 ${
                            shapeOverlay === shape.id
                              ? "shadow-lg shadow-cyan-200/60 ring-1 ring-cyan-300/60 dark:shadow-cyan-500/20 dark:ring-cyan-400/60"
                              : ""
                          }`}
                        >
                          <span className="text-[11px] font-medium text-slate-900 dark:text-white">{shape.label}</span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-300">{shape.description}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShapeOverlay(null)}
                        className={`flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 p-2 text-center transition hover:border-cyan-400/60 dark:border-white/10 dark:bg-white/5 ${
                          shapeOverlay === null
                            ? "shadow-lg shadow-cyan-200/60 ring-1 ring-cyan-300/60 dark:shadow-cyan-500/20 dark:ring-cyan-400/60"
                            : ""
                        }`}
                      >
                        <span className="text-[11px] font-medium text-slate-900 dark:text-white">None</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-300">Original canvas</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid flex-1 grid-cols-2 gap-3 text-[11px] text-slate-600 dark:text-slate-200 sm:text-xs">
                    <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-purple-600 dark:text-purple-200/80">
                        Original size
                      </p>
                      <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">
                        {originalDimensions ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-purple-600 dark:text-purple-200/80">
                        Output padding
                      </p>
                      <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">
                        {padPercentage}%
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-300">
                        Maskable icons add ~12% automatically.
                      </p>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-purple-600 dark:text-purple-200/80">
                        Output bundle includes
                      </p>
                      <ul className="mt-2 grid gap-1 text-[11px] text-slate-500 dark:text-slate-300 sm:text-xs">
                        <li>• Web manifest + favicon.ico</li>
                        <li>• Android adaptive & monochrome</li>
                        <li>• iOS Contents.json ready for Xcode</li>
                      </ul>
                    </div>
                    {qualityHints.length > 0 && (
                      <div className="col-span-2 space-y-2">
                        {qualityHints.map((hint) => (
                          <div
                            key={hint.id}
                            className={`rounded-2xl border px-3 py-3 text-left text-[11px] text-slate-900 shadow-lg dark:text-slate-100 ${severityStyles[hint.severity]}`}
                          >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-700 dark:text-white/80">
                              {hint.title}
                            </p>
                            <p className="mt-2 text-xs text-slate-700 dark:text-white/80">{hint.detail}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300/60 bg-white/70 text-center text-sm text-slate-600 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-300">
                  Click the upload chip or drag &amp; drop an SVG/PNG anywhere on this canvas to begin.
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-2xl shadow-purple-200/40 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-purple-900/20">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div className="space-y-0.5">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Global Padding</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Fine-tune negative space for all rendered sizes simultaneously.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-200/70">
                    Current
                  </span>
                  <span className="ml-2 text-base font-semibold text-slate-900 dark:text-white">{padPercentage}%</span>
                </div>
              </div>
              <div className="mt-3">
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={padPct * 100}
                  onChange={(e) => setPadPct(parseInt(e.target.value, 10) / 100)}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:bg-slate-900/60 dark:accent-cyan-400 dark:focus:ring-cyan-400/70"
                />
                <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-400">
                  <span>0%</span>
                  <span>5%</span>
                  <span>10%</span>
                  <span>15%</span>
                  <span>20%</span>
                </div>
              </div>
            </section>
          </div>

          <aside className="flex flex-[1] flex-col gap-4 overflow-hidden">
            <section className="flex flex-1 min-h-0 flex-col rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-2xl shadow-blue-200/40 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-blue-900/20">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Preset Targets</h2>
                <button
                  type="button"
                  className="text-[11px] uppercase tracking-[0.35em] text-cyan-600 transition hover:text-cyan-500 dark:text-cyan-200/80 dark:hover:text-cyan-200"
                  onClick={() =>
                    setSelected((prev) => {
                      const anyUnchecked = presetEntries.some(([key]) => !prev[key]);
                      if (anyUnchecked) {
                        const next: Record<PresetKey, boolean> = { ...prev };
                        for (const [key] of presetEntries) next[key] = true;
                        return next;
                      }
                      const next: Record<PresetKey, boolean> = { ...prev };
                      for (const [key] of presetEntries) next[key] = false;
                      return next;
                    })
                  }
                >
                  Toggle All
                </button>
              </div>
              <ul className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto pr-1 text-xs text-slate-600 dark:text-slate-200 sm:text-sm">
                {presetEntries.map(([key, value]) => {
                  const checked = selected[key];
                  return (
                    <li
                      key={key}
                      className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition dark:border-white/10 ${
                        checked
                          ? "bg-gradient-to-r from-cyan-200/25 via-blue-200/25 to-purple-200/25 shadow-lg shadow-cyan-200/40 dark:from-cyan-500/25 dark:via-blue-500/25 dark:to-purple-500/25 dark:shadow-cyan-900/20"
                          : "bg-slate-100 dark:bg-slate-900/60"
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium capitalize text-slate-900 dark:text-white">
                          {value.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                          {value.tasks.length} asset{value.tasks.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setSelected((s) => ({ ...s, [key]: e.target.checked }))
                          }
                          className="peer sr-only"
                        />
                        <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-gradient-to-r peer-checked:from-cyan-400 peer-checked:to-purple-400 dark:bg-slate-700/80" />
                        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-400/80 via-blue-400/80 to-purple-500/80 p-5 text-white shadow-2xl shadow-purple-300/40 dark:border-white/10 dark:from-cyan-500/80 dark:via-blue-500/80 dark:to-purple-600/80 dark:shadow-purple-900/40">
              <h2 className="text-lg font-semibold">Export bundle</h2>
              <p className="mt-1 text-xs text-white/80">
                Generates zipped folders with manifests, adaptive icons, Apple Contents.json, and Windows ICOs.
              </p>
              <button
                disabled={!ready || busy}
                onClick={buildZip}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-white/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-cyan-200/40 transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:shadow-cyan-900/30 dark:hover:bg-white/20"
              >
                {busy ? "Generating…" : "Download ZIP"}
              </button>
              <ul className="mt-4 space-y-1.5 text-[11px] text-white/80">
                <li>• Transparent-safe PNG resizing in-browser.</li>
                <li>• Keeps intermediate PNGs alongside ICOs for QA.</li>
                <li>• No upload necessary — privacy by design.</li>
              </ul>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

function Preview({
  img,
  size,
  padPct,
  shapeOverlay,
}: {
  img: HTMLImageElement;
  size: number;
  padPct: number;
  shapeOverlay: string | null;
}) {
  const dataUrl = useMemo(() => {
    const canvas = renderToCanvas(img, size, padPct);
    return canvas.toDataURL("image/png");
  }, [img, size, padPct]);

  if (!dataUrl) return null;

  return (
    <div className="relative flex items-center justify-center">
      <img
        src={dataUrl}
        width={size}
        height={size}
        className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        alt="Preview"
      />
      {shapeOverlay && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="h-full w-full border-2 border-cyan-200/70 bg-cyan-200/5 backdrop-blur-[1px]"
            style={{
              borderRadius:
                overlayShapes.find((s) => s.id === shapeOverlay)?.borderRadius ?? "0",
            }}
          />
        </div>
      )}
    </div>
  );
}

