import { useCallback, useMemo, useRef, useState } from "react";
import { extractPalette, paletteToCssVariables, paletteToJson, paletteToTailwind, type PaletteColor, rgbToHex } from "../utils/palette";
import { loadImageFromFile } from "../utils/image";

type ExportFormat = "tailwind" | "css" | "json";

export default function PaletteSmithPage() {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<PaletteColor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("tailwind");
  const [count, setCount] = useState(8);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (targetFile: File | null | undefined) => {
    if (!targetFile) return;
    setError(null);
    setBusy(true);
    try {
      const img = await loadImageFromFile(targetFile);
      setFile(targetFile);
      setImage(img);
      const colors = await extractPalette(img, count);
      setPalette(colors);
      setSelectedColor(colors[0] ?? null);
    } catch (err) {
      console.error(err);
      setError("Unable to extract palette from this file.");
    } finally {
      setBusy(false);
    }
  }, [count]);

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

  const exportOutput = useMemo(() => {
    if (palette.length === 0) return "";
    switch (exportFormat) {
      case "tailwind":
        return paletteToTailwind(palette);
      case "css":
        return paletteToCssVariables(palette);
      case "json":
        return paletteToJson(palette);
      default:
        return "";
    }
  }, [palette, exportFormat]);

  const averageHex = useMemo(() => {
    if (palette.length === 0) return "#000000";
    const avg = palette.reduce((acc, { rgb }) => {
      return [acc[0] + rgb[0], acc[1] + rgb[1], acc[2] + rgb[2]] as [number, number, number];
    }, [0, 0, 0] as [number, number, number]);
    const normalised: [number, number, number] = [
      Math.round(avg[0] / palette.length),
      Math.round(avg[1] / palette.length),
      Math.round(avg[2] / palette.length),
    ];
    return rgbToHex(normalised);
  }, [palette]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-teal-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">PaletteSmith</h1>
            <p className="text-sm text-slate-200/80">
              Drop an image to extract dominant colours. Export as Tailwind config, CSS variables, or JSON tokens.
            </p>
          </div>
          <label className="group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500/80 via-blue-500/80 to-purple-500/80 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
            <span className="z-10">{file?.name ?? "Select image"}</span>
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition group-hover:opacity-100" />
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
          className={`mt-6 flex min-h-[220px] flex-1 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-sm transition ${file ? "border-solid border-white/10" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          {image ? (
            <div className="flex w-full flex-col gap-4 lg:flex-row">
              <div className="flex flex-1 items-center justify-center">
                <img src={image.src} alt={file?.name ?? "palette source"} className="max-h-64 rounded-2xl border border-white/10 object-contain" />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-slate-200/80">
                  <div className="space-y-1">
                    <p className="uppercase tracking-[0.35em] text-cyan-200/80">Colours</p>
                    <p className="text-lg font-semibold text-white">{palette.length}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="uppercase tracking-[0.35em] text-cyan-200/80">Swatches</label>
                    <input
                      type="range"
                      min={4}
                      max={12}
                      value={count}
                      onChange={async (e) => {
                        const next = parseInt(e.target.value, 10);
                        setCount(next);
                        if (image && file) {
                          const colors = await extractPalette(image, next);
                          setPalette(colors);
                          setSelectedColor(colors[0] ?? null);
                        }
                      }}
                      className="h-2 w-40 cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {palette.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      className={`group flex h-20 flex-col justify-between rounded-2xl border border-white/10 p-3 text-left transition ${
                        selectedColor?.hex === color.hex ? "ring-2 ring-cyan-300" : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColor(color)}
                    >
                      <span className="text-xs font-semibold text-black/80 mix-blend-screen drop-shadow">{color.hex}</span>
                      <span className="text-[11px] uppercase text-black/70 mix-blend-screen">{color.rgb.join(", ")}</span>
                    </button>
                  ))}
                </div>
                {selectedColor && (
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-3 text-xs text-slate-200">
                    <div
                      className="h-10 w-10 rounded-xl border border-white/10"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <div>
                      <p className="font-semibold text-white">{selectedColor.hex}</p>
                      <p className="text-slate-300">RGB {selectedColor.rgb.join(", ")}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/80">Average</p>
                      <p className="text-sm font-semibold text-white">{averageHex}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-200/70">
              {busy ? "Extracting palette…" : "Drag & drop an image here or use the picker"}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/50 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}
      </div>

      <section className="grid flex-1 gap-6 md:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Export palette</h2>
            <div className="flex gap-2 text-xs">
              {exportFormats.map((format) => (
                <button
                  key={format.value}
                  type="button"
                  className={`rounded-full border border-white/10 px-4 py-1 uppercase tracking-[0.3em] transition ${
                    exportFormat === format.value ? "bg-white/20 text-white" : "bg-white/5 text-slate-200/70 hover:bg-white/10"
                  }`}
                  onClick={() => setExportFormat(format.value)}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-[260px] overflow-auto rounded-2xl bg-black/60 p-4 font-mono text-xs text-cyan-100 shadow-inner shadow-cyan-500/10">
            <pre className="whitespace-pre-wrap">{exportOutput}</pre>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Usage ideas</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-200/80">
            <li>• Drop brand marks to instantly craft Tailwind themes.</li>
            <li>• Export JSON tokens for design system pipelines.</li>
            <li>• Copy CSS variables to your design tokens stylesheet.</li>
            <li>• Use swatches to compare contrast and accessibility quickly.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

const exportFormats: { value: ExportFormat; label: string }[] = [
  { value: "tailwind", label: "Tailwind" },
  { value: "css", label: "CSS vars" },
  { value: "json", label: "JSON" },
];

