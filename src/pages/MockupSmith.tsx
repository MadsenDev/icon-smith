import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { loadImageFromFile } from "../utils/image";

type Frame = "browser" | "macbook" | "iphone" | "none";

type UploadedAsset = {
  file: File;
  url: string;
};

const frames: { value: Frame; label: string }[] = [
  { value: "browser", label: "Browser" },
  { value: "macbook", label: "MacBook" },
  { value: "iphone", label: "iPhone" },
  { value: "none", label: "None" },
];

export default function MockupSmithPage() {
  const [asset, setAsset] = useState<UploadedAsset | null>(null);
  const [frame, setFrame] = useState<Frame>("browser");
  const [background, setBackground] = useState("#0F172A");
  const [label, setLabel] = useState("IconSmith");
  const canvasRef = useRef<HTMLDivElement>(null);

  const frameClass = useMemo(() => frameStyles(frame), [frame]);

  async function handleAsset(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const image = await loadImageFromFile(file);
    setAsset({ file, url: image.src });
    e.target.value = "";
  }

  function clearAsset() {
    if (asset) URL.revokeObjectURL(asset.url);
    setAsset(null);
  }

  async function downloadMockup() {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current, { backgroundColor: null, scale: 2 });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${label || "mockup"}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">MockupSmith</h1>
            <p className="text-sm text-slate-200/80">
              Place screenshots or logos into device/browser frames. Export high-resolution mockups for landing pages and OG images.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <label className="group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500/80 via-blue-500/80 to-purple-500/80 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
              <span className="z-10">{asset ? asset.file.name : "Select asset"}</span>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition group-hover:opacity-100" />
              <input type="file" accept="image/*" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={handleAsset} />
            </label>
            <button
              type="button"
              onClick={downloadMockup}
              disabled={!asset}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
            >
              Download PNG
            </button>
            <button
              type="button"
              onClick={clearAsset}
              disabled={!asset}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <section className="grid flex-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
          <div className="space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
            Frame
            <div className="grid gap-2 sm:grid-cols-2">
              {frames.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`rounded-2xl border px-4 py-3 text-left text-xs transition ${
                    frame === option.value ? "border-cyan-300 bg-cyan-500/30 text-white" : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                  }`}
                  onClick={() => setFrame(option.value)}
                >
                  <span className="font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
            Label
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
            Background
            <input
              type="color"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="h-10 w-24 cursor-pointer rounded-xl border border-white/10 bg-white/10"
            />
          </label>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
            <p className="font-semibold text-white">Tips</p>
            <ul className="mt-2 space-y-1 text-[11px]">
              <li>• Use high-resolution assets for crisp exports (1200px+ recommended).</li>
              <li>• Custom backgrounds help match brand colour schemes.</li>
              <li>• Combine with OGSmith for share-ready images.</li>
            </ul>
          </div>
        </div>

        <div
          ref={canvasRef}
          className="relative flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-purple-900/20 backdrop-blur"
          style={{ background }}
        >
          {asset ? (
            <div className={`relative flex items-center justify-center ${frameClass.container}`}>
              {frameClass.overlay && <div className={frameClass.overlay} />}
              <img src={asset.url} alt="Mockup" className={frameClass.image} />
              {frame !== "none" && label && <span className={frameClass.label}>{label}</span>}
            </div>
          ) : (
            <p className="text-sm text-slate-200/70">Select an asset to preview in the chosen frame.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function frameStyles(frame: Frame) {
  switch (frame) {
    case "browser":
      return {
        container: "w-[720px] rounded-3xl border border-white/20 bg-black/60 p-6",
        overlay: "absolute inset-0 rounded-3xl border border-white/20",
        image: "h-[420px] w-full rounded-2xl object-cover",
        label: "absolute left-8 top-4 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white",
      };
    case "macbook":
      return {
        container: "w-[700px] rounded-[32px] border-[6px] border-white/30 bg-black/80 p-6",
        overlay: "absolute inset-0 rounded-[28px] border border-white/20",
        image: "h-[400px] w-full rounded-[20px] object-cover",
        label: "absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white",
      };
    case "iphone":
      return {
        container: "w-[260px] rounded-[48px] border-[8px] border-white/30 bg-black/80 p-4",
        overlay: "absolute inset-0 rounded-[40px] border border-white/20",
        image: "h-[500px] w-full rounded-[32px] object-cover",
        label: "absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white",
      };
    case "none":
    default:
      return {
        container: "w-[720px]",
        overlay: "",
        image: "h-[420px] w-full rounded-2xl border border-white/15 object-cover",
        label: "hidden",
      };
  }
}
