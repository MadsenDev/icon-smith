import { useCallback, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { canvasToPNGBlob, loadImageFromFile, renderToCanvas } from "../utils/image";
import { encodeICO, type IconSource } from "../utils/ico";

type FaviconTarget = {
  path: string;
  size: number;
};

const faviconPngTargets: FaviconTarget[] = [
  { path: "favicon-16.png", size: 16 },
  { path: "favicon-32.png", size: 32 },
  { path: "favicon-48.png", size: 48 },
  { path: "favicon-64.png", size: 64 },
  { path: "favicon-128.png", size: 128 },
  { path: "favicon-180.png", size: 180 },
  { path: "favicon-192.png", size: 192 },
  { path: "favicon-256.png", size: 256 },
  { path: "favicon-512.png", size: 512 },
];

const manifestIcons = [
  { src: "favicon-192.png", sizes: "192x192", type: "image/png" },
  { src: "favicon-512.png", sizes: "512x512", type: "image/png" },
];

export default function FaviconSmithPage() {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [previewSize, setPreviewSize] = useState(64);
  const [padding, setPadding] = useState(0);
  const [background, setBackground] = useState("transparent");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ready = !!image;

  const manifestJson = useMemo(() => {
    return JSON.stringify(
      {
        name: "Your App",
        short_name: "App",
        icons: manifestIcons,
        start_url: ".",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#111827",
      },
      null,
      2,
    );
  }, []);

  const handleFile = useCallback(async (targetFile: File | null | undefined) => {
    if (!targetFile) return;
    setError(null);
    setBusy(true);
    try {
      const img = await loadImageFromFile(targetFile);
      setFile(targetFile);
      setImage(img);
    } catch (err) {
      console.error(err);
      setError("Unable to load this file. Please try a different image.");
    } finally {
      setBusy(false);
    }
  }, []);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    await handleFile(e.target.files?.[0] ?? null);
    e.target.value = "";
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    await handleFile(e.dataTransfer.files?.[0] ?? null);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  async function downloadIco() {
    if (!image) return;
    setBusy(true);
    try {
      const icons: IconSource[] = await Promise.all(
        [16, 32, 48, 64, 128, 256].map(async (size) => {
          const canvas = renderToCanvas(image, size, padding, background);
          const blob = await canvasToPNGBlob(canvas);
          return { size, blob };
        }),
      );
      const ico = await encodeICO(icons);
      saveAs(ico, "favicon.ico");
    } finally {
      setBusy(false);
    }
  }

  async function downloadZip() {
    if (!image) return;
    setBusy(true);
    try {
      const zip = new JSZip();
      const icoSources: IconSource[] = [];

      for (const target of faviconPngTargets) {
        const canvas = renderToCanvas(image, target.size, padding, background);
        const blob = await canvasToPNGBlob(canvas);
        zip.file(target.path, blob);
        if ([16, 32, 48, 64, 128, 256].includes(target.size)) {
          icoSources.push({ blob, size: target.size });
        }
      }

      const ico = await encodeICO(icoSources);
      zip.file("favicon.ico", ico);
      zip.file("site.webmanifest", manifestJson);

      const out = await zip.generateAsync({ type: "blob" });
      const baseName = file?.name?.replace(/\.\w+$/, "") || "favicon";
      saveAs(out, `${baseName}-favicons.zip`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">FaviconSmith</h1>
            <p className="text-sm text-slate-200/80">
              Generate a complete favicon bundle: multi-size PNGs, favicon.ico, and a ready-to-tweak `site.webmanifest`.
            </p>
          </div>
          <label className="group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border border-purple-400/50 bg-gradient-to-r from-purple-500/80 via-blue-500/80 to-cyan-500/80 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/30 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400">
            <span className="z-10">{file?.name ?? "Select source image"}</span>
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 transition group-hover:opacity-100" />
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={onPick}
            />
          </label>
        </div>

        <div
          className={`mt-6 flex min-h-[220px] flex-1 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-sm transition ${ready ? "border-solid border-white/10" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          {ready && image ? (
            <div className="flex w-full flex-col gap-6 lg:flex-row">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="grid place-items-center rounded-2xl border border-white/10 bg-white/10 p-6"
                  style={{ background: background === "transparent" ? "transparent" : background }}
                >
                  <img
                    src={image.src}
                    alt={file?.name ?? "favicon source"}
                    className="rounded-xl border border-white/10 object-contain"
                    style={{
                      width: previewSize,
                      height: previewSize,
                      padding: previewSize * padding,
                      background: background === "transparent" ? "transparent" : background,
                    }}
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200/80">
                  <label className="uppercase tracking-[0.35em] text-cyan-200/80">Preview size</label>
                  <input
                    type="range"
                    min={16}
                    max={256}
                    step={16}
                    value={previewSize}
                    onChange={(e) => setPreviewSize(parseInt(e.target.value, 10))}
                    className="h-2 w-40 cursor-pointer accent-cyan-400"
                  />
                  <span>{previewSize}px</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">Padding</p>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={Math.round(padding * 100)}
                      onChange={(e) => setPadding(parseInt(e.target.value, 10) / 100)}
                      className="mt-2 h-2 w-full cursor-pointer accent-cyan-400"
                    />
                    <p className="mt-1 text-xs">{Math.round(padding * 100)}%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">Background</p>
                    <div className="mt-2 flex gap-2">
                      {backgroundOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`flex-1 rounded-2xl border px-3 py-2 text-center transition ${
                            background === option.value
                              ? "border-cyan-300 bg-cyan-500/30"
                              : "border-white/10 bg-white/10 hover:border-cyan-300/60"
                          }`}
                          onClick={() => setBackground(option.value)}
                        >
                          <span className="block text-xs text-white">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">Download</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white/20 disabled:opacity-50"
                      onClick={downloadIco}
                    >
                      favicon.ico
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white/20 disabled:opacity-50"
                      onClick={downloadZip}
                    >
                      ZIP bundle
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">site.webmanifest</p>
                  <pre className="mt-3 h-40 overflow-auto rounded-xl bg-black/60 p-3 font-mono text-[11px] text-cyan-100 shadow-inner shadow-cyan-900/30">
                    {manifestJson}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-200/70">
              {busy ? "Preparing preview…" : "Drag & drop an image here or use the picker"}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/50 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}
      </div>

      <section className="grid flex-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-purple-900/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">What’s included</h2>
          <ul className="mt-4 space-y-2">
            <li>• PNGs at common sizes (16–512px), padded & background-adjusted.</li>
            <li>• `favicon.ico` containing 16–256px layers.</li>
            <li>• Starter `site.webmanifest` referencing the exported icons.</li>
            <li>• Future-ready structure for PWA and desktop install prompts.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Tips</h2>
          <ul className="mt-4 space-y-2">
            <li>• Use transparency for rounded icons; add background colour if you need a solid frame.</li>
            <li>• For crisp results, start with a square SVG or large PNG (512px+).</li>
            <li>• Add app shortcuts and theme colours by editing the exported manifest.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

const backgroundOptions = [
  { value: "transparent", label: "Transparent" },
  { value: "#0F172A", label: "Slate" },
  { value: "#FFFFFF", label: "White" },
  { value: "#111111", label: "Black" },
];


