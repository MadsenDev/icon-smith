import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type FileItem = {
  id: string;
  file: File;
  newName: string;
  resize: boolean;
  maxWidth: number;
  format: "png" | "jpg" | "webp";
};

export default function ExportSmithPage() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const handleUpload = (list: FileList | null) => {
    if (!list) return;
    const next: FileItem[] = [];
    Array.from(list).forEach((file) => {
      next.push({
        id: crypto.randomUUID(),
        file,
        newName: file.name.replace(/\.(png|jpg|jpeg|webp)$/i, ""),
        resize: false,
        maxWidth: 1024,
        format: "png",
      });
    });
    setFiles((prev) => [...prev, ...next]);
  };

  const handleDownload = async () => {
    if (files.length === 0) return;
    const zip = new JSZip();
    const folder = zip.folder("exports");
    if (!folder) return;
    for (const item of files) {
      folder.file(`${item.newName}.${item.format}`, await item.file.arrayBuffer());
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "export-smith.zip");
  };

  const updateItem = (id: string, update: Partial<FileItem>) => {
    setFiles((prev) => prev.map((item) => (item.id === id ? { ...item, ...update } : item)));
  };

  const removeItem = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">ExportSmith</h1>
            <p className="text-sm text-slate-200/80">
              Batch rename, resize, reformat, and package assets in one streamlined pipeline. Drop files, configure rules, and download a zip.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
          >
            Download bundle
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20">
          <div className="flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Upload assets</h2>
            <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-slate-900/40 text-sm text-slate-300">
              <input type="file" multiple className="hidden" onChange={(event) => handleUpload(event.target.files)} />
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200">Choose files</span>
              <p className="text-xs text-slate-400">Supports PNG, JPG, WEBP</p>
            </label>
          </div>
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Pipeline ({files.length})</h2>
            <div className="space-y-3">
              {files.map((item) => (
                <div key={item.id} className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">{item.file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-rose-200 transition hover:bg-rose-500/20"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1 text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">
                      New name
                      <input
                        value={item.newName}
                        onChange={(event) => updateItem(item.id, { newName: event.target.value })}
                        className="rounded-lg border border-white/10 bg-slate-900/40 px-2 py-1 text-sm text-white outline-none"
                      />
                    </label>
                    <label className="grid gap-1 text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">
                      Format
                      <select
                        value={item.format}
                        onChange={(event) => updateItem(item.id, { format: event.target.value as FileItem["format"] })}
                        className="rounded-lg border border-white/10 bg-slate-900/40 px-2 py-1 text-sm text-white outline-none"
                      >
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="webp">WEBP</option>
                      </select>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">
                    <input
                      type="checkbox"
                      checked={item.resize}
                      onChange={(event) => updateItem(item.id, { resize: event.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
                    />
                    Resize to max width
                    {item.resize && (
                      <input
                        type="number"
                        min={64}
                        max={4096}
                        value={item.maxWidth}
                        onChange={(event) => updateItem(item.id, { maxWidth: Number(event.target.value) })}
                        className="w-20 rounded-lg border border-white/10 bg-slate-900/40 px-2 py-1 text-sm text-white outline-none"
                      />
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20">
          <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Summary</h2>
          <p className="text-sm text-slate-200">
            Configure naming, resizing, and conversion rules. The final bundle packages everything as a zip for easy import into projects.
          </p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• Rename files without losing originals.</li>
            <li>• Convert formats on the fly (PNG, JPG, WEBP).</li>
            <li>• Optional max width resizing for large assets.</li>
            <li>• Bundle outputs as a ready-to-share zip.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

