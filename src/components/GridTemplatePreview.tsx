import type { CSSProperties } from "react";

const fallbackPalette = [
  "bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20",
  "bg-gradient-to-br from-sky-500/20 via-transparent to-blue-500/20",
  "bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20",
];

export function GridTemplatePreview({ columns, rows }: { columns: string; rows?: string }) {
  const style: CSSProperties = {
    display: "grid",
    gridTemplateColumns: columns,
    gridTemplateRows: rows || undefined,
    gap: 8,
    padding: 8,
  };

  const columnCount = columns.split(/\s+/).filter(Boolean).length || 3;
  const rowCount = rows ? rows.split(/\s+/).filter(Boolean).length : 2;
  const estimateCount = Math.max(6, columnCount * Math.max(2, rowCount));

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
      <div className="grid" style={style}>
        {Array.from({ length: estimateCount }).map((_, index) => (
          <div
            key={index}
            className={`flex items-center justify-center rounded-xl border border-white/10 text-[10px] uppercase tracking-[0.3em] text-slate-100 ${fallbackPalette[index % fallbackPalette.length]}`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

