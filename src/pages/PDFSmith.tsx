import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import JSZip from "jszip";

export default function PDFSmithPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [splitPages, setSplitPages] = useState(false);

  const handleUpload = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list).filter((file) => file.name.endsWith(".pdf"))]);
  };

  const clearFiles = () => setFiles([]);

  const merge = async () => {
    if (files.length === 0) return;
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const mergedBytes = await mergedPdf.save();
    saveAs(new Blob([mergedBytes], { type: "application/pdf" }), "merged.pdf");
  };

  const split = async () => {
    if (!splitPages) return;
    const zip = new JSZip();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      for (const index of pdf.getPageIndices()) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [index]);
        newPdf.addPage(page);
        const data = await newPdf.save();
        zip.file(`${file.name.replace(/\.pdf$/i, "")}-page-${index + 1}.pdf`, data);
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "split-pages.zip");
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">PDFSmith</h1>
            <p className="text-sm text-slate-200/80">Merge, split, and download PDFs entirely in the browser using pdf-lib.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-200">
            <button
              type="button"
              onClick={merge}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-1 uppercase tracking-[0.35em] transition hover:bg-white/20"
            >
              Merge PDFs
            </button>
            <button
              type="button"
              onClick={split}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-1 uppercase tracking-[0.35em] transition hover:bg-white/20"
            >
              Split pages
            </button>
            <button
              type="button"
              onClick={clearFiles}
              className="rounded-full border border-white/10 bg-rose-500/10 px-4 py-1 uppercase tracking-[0.35em] text-rose-200 transition hover:bg-rose-500/20"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20">
          <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Input PDFs</h2>
          <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-slate-900/40 text-sm text-slate-300">
            <input type="file" accept="application/pdf" multiple className="hidden" onChange={(event) => handleUpload(event.target.files)} />
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200">Upload PDFs</span>
            <p className="text-xs text-slate-400">Drop files or click to browse</p>
          </label>
          <div className="space-y-2 text-xs text-slate-300">
            <p>{files.length} file{files.length === 1 ? "" : "s"} selected</p>
            <ul className="space-y-1">
              {files.map((file) => (
                <li key={file.name} className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1">{file.name}</li>
              ))}
            </ul>
          </div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
            <input
              type="checkbox"
              checked={splitPages}
              onChange={(event) => setSplitPages(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
            />
            Enable split-by-page ZIP export
          </label>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-teal-900/20">
          <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">What you can do</h2>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• Merge multiple PDFs into a single document (order is preserved).</li>
            <li>• Optionally split each uploaded PDF into individual pages inside a ZIP archive.</li>
            <li>• Run entirely in-browser; no files leave your machine.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

