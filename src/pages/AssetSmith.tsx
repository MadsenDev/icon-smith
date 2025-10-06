import { useMemo, useState } from "react";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const qualityPresets = [
  { label: "Ultra", value: 0.2 },
  { label: "High", value: 0.4 },
  { label: "Balanced", value: 0.6 },
  { label: "Light", value: 0.8 },
];

type CompressionTarget = {
  id: string;
  original: File;
  compressed?: File;
  previewUrl: string;
  originalSize: number;
  compressedSize?: number;
  ratio?: number;
  type: string;
};

export default function AssetSmithPage() {
  const [files, setFiles] = useState<CompressionTarget[]>([]);
  const [quality, setQuality] = useState(0.6);
  const [maxWidth, setMaxWidth] = useState(2048);
  const [maxHeight, setMaxHeight] = useState(2048);
  const [inProgress, setInProgress] = useState(false);

  const totalOriginalBytes = useMemo(() => files.reduce((sum, file) => sum + file.originalSize, 0), [files]);
  const totalCompressedBytes = useMemo(
    () => files.reduce((sum, file) => sum + (file.compressedSize ?? 0), 0),
    [files],
  );

  function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    if (list.length === 0) return;
    const next = list.map((file) => ({
      id: crypto.randomUUID(),
      original: file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      type: file.type,
    } satisfies CompressionTarget));
    setFiles((prev) => [...prev, ...next]);
    e.target.value = "";
  }

  async function compressAll() {
    if (files.length === 0) return;
    setInProgress(true);
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const compressed = await imageCompression(file.original, {
            maxWidthOrHeight: Math.max(maxWidth, maxHeight),
            initialQuality: quality,
            useWebWorker: true,
            fileType: file.type.includes("image/") ? file.type : undefined,
          });

          return {
            ...file,
            compressed,
            compressedSize: compressed.size,
            ratio: compressed.size / file.originalSize,
          } satisfies CompressionTarget;
        }),
      );
      setFiles(results);
    } finally {
      setInProgress(false);
    }
  }

  function clearAll() {
    files.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    setFiles([]);
  }

  async function downloadZip() {
    const available = files.filter((file) => file.compressed);
    if (available.length === 0) return;

    const zip = new JSZip();
    await Promise.all(
      available.map(async (file) => {
        const arrayBuffer = await file.compressed!.arrayBuffer();
        zip.file(file.compressed!.name ?? renameFile(file.original.name, "compressed"), arrayBuffer);
      }),
    );

    const out = await zip.generateAsync({ type: "blob" });
    saveAs(out, "asset-smith-compressed.zip");
  }

  function renameFile(name: string, suffix: string) {
    const dotIndex = name.lastIndexOf(".");
    if (dotIndex === -1) return `${name}-${suffix}`;
    return `${name.slice(0, dotIndex)}-${suffix}${name.slice(dotIndex)}`;
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">AssetSmith</h1>
            <p className="text-sm text-slate-200/80">
              Compress images in-browser with adjustable quality and dimensions. Preview reductions, then download individual conversions or a ZIP bundle.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <label className="group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500/80 via-blue-500/80 to-purple-500/80 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
              <span className="z-10">{files.length ? `${files.length} assets` : "Select images"}</span>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition group-hover:opacity-100" />
              <input type="file" accept="image/*" multiple className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={handleFileSelection} />
            </label>
            <button
              type="button"
              onClick={compressAll}
              disabled={files.length === 0 || inProgress}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
            >
              {inProgress ? "Processing…" : "Compress"}
            </button>
            <button
              type="button"
              onClick={downloadZip}
              disabled={!files.some((file) => file.compressed)}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
            >
              Download ZIP
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={files.length === 0}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <section className="grid flex-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Settings</h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                Quality
                <div className="flex flex-wrap gap-2 text-sm">
                  {qualityPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className={`rounded-full border px-4 py-2 transition ${
                        preset.value === quality
                          ? "border-cyan-300 bg-cyan-500/30 text-white"
                          : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                      }`}
                      onClick={() => setQuality(preset.value)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.95}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="mt-2 h-2 w-full cursor-pointer accent-cyan-400"
                />
                <span className="text-sm text-slate-200/70">Quality: {Math.round(quality * 100)}%</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                  Max width (px)
                  <input
                    type="number"
                    min={0}
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                  />
                </label>
                <label className="block space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                  Max height (px)
                  <input
                    type="number"
                    min={0}
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                  />
                </label>
              </div>

              <p className="text-xs text-slate-200/70">
                Leave max width/height zero to keep original dimensions. Quality slider controls compression strength.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-purple-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Summary</h2>
            <div className="mt-4 grid gap-4 text-xs text-slate-200/80 sm:grid-cols-2">
              <SummaryCard title="Original" value={formatBytes(totalOriginalBytes)} subtitle={`${files.length} files`} />
              <SummaryCard title="Compressed" value={formatBytes(totalCompressedBytes)} subtitle={files.some((f) => f.compressed) ? "After compression" : "Run compress"} />
              <SummaryCard
                title="Savings"
                value={totalCompressedBytes ? `${Math.max(0, 100 - Math.round((totalCompressedBytes / totalOriginalBytes) * 100)).toFixed(0)}%` : "—"}
                subtitle="Space reduced"
              />
              <SummaryCard title="Quality" value={`${Math.round(quality * 100)}%`} subtitle="Approximate" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {files.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/70 shadow-2xl shadow-blue-900/20 backdrop-blur">
              Select images to start compressing.
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">Images</h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {files.map((file) => (
                  <article key={file.id} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80 shadow-inner shadow-black/30">
                    <div className="flex items-center gap-3">
                      <img src={file.previewUrl} alt={file.original.name} className="h-14 w-14 rounded object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-white">{file.original.name}</p>
                        <p className="text-[11px] text-slate-200/70">{formatBytes(file.originalSize)}</p>
                        {file.compressedSize && (
                          <p className="text-[11px] text-cyan-200/80">
                            {formatBytes(file.compressedSize)} ({Math.round((file.compressedSize / file.originalSize) * 100)}%)
                          </p>
                        )}
                      </div>
                    </div>
                    {file.compressed && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
                          onClick={() => saveAs(file.compressed!, renameFile(file.original.name, "compressed"))}
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
                          onClick={() => navigator.clipboard.writeText(formatBytes(file.compressedSize!))}
                        >
                          Copy size
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">{title}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <p className="text-[11px] text-slate-200/70">{subtitle}</p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / Math.pow(1024, index);
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[index]}`;
}
