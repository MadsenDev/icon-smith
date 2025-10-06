import { useMemo, useState } from "react";
import { useDiff } from "../hooks/useDiff";
import type { DiffLine } from "../utils/diff";

const defaultBase = `{
  "id": 1,
  "title": "IconSmith",
  "tags": ["icons", "vite", "react"],
  "meta": {
    "status": "stable",
    "updated": "2025-09-21"
  }
}`;

const defaultTarget = `{
  "id": 1,
  "title": "IconSmith",
  "description": "Resize and export icons for every platform.",
  "tags": ["icons", "react", "tailwind"],
  "meta": {
    "status": "stable",
    "updated": "2025-10-12",
    "owner": "@smith-suite"
  }
}`;

type Mode = "text" | "json";

export default function DiffSmithPage() {
  const [baseInput, setBaseInput] = useState<string>(defaultBase);
  const [targetInput, setTargetInput] = useState<string>(defaultTarget);
  const [mode, setMode] = useState<Mode>("json");
  const [view, setView] = useState<"split" | "unified">("split");

  const { diff, summary, base, target } = useDiff(baseInput, targetInput, {
    autoFormatJson: mode === "json",
  });

  const stats = useMemo(() => {
    const totalChanges = summary.additions + summary.deletions;
    return {
      totalChanges,
      additions: summary.additions,
      deletions: summary.deletions,
      unchanged: summary.unchanged,
    };
  }, [summary]);

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">DiffSmith</h1>
            <p className="text-sm text-slate-200/80">
              Compare text or JSON, highlight changes, and export merge-ready snippets.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-200">
            <ToggleGroup
              label="Mode"
              value={mode}
              onChange={(value) => setMode(value as Mode)}
              options={[
                { value: "text", label: "Text" },
                { value: "json", label: "JSON" },
              ]}
            />
            <ToggleGroup
              label="View"
              value={view}
              onChange={(value) => setView(value as "split" | "unified")}
              options={[
                { value: "split", label: "Split" },
                { value: "unified", label: "Unified" },
              ]}
            />
          </div>
        </div>
      </header>

      <section className="grid flex-1 gap-6 xl:grid-cols-2">
        <EditorPanel
          title="Base"
          value={baseInput}
          placeholder="Original text or JSON"
          onChange={setBaseInput}
        />
        <EditorPanel
          title="Target"
          value={targetInput}
          placeholder="Updated text or JSON"
          onChange={setTargetInput}
        />
      </section>

      <section className="space-y-6">
        <DiffSummary stats={stats} />
        <DiffViewer diff={diff} base={base} target={target} view={view} />
      </section>
    </div>
  );
}

function EditorPanel({
  title,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">{title}</h2>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-56 min-h-[14rem] w-full rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-xs text-slate-100 shadow-inner shadow-cyan-500/20 focus:outline-none"
      />
    </div>
  );
}

function ToggleGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-2">
      <p className="px-2 text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">{label}</p>
      <div className="mt-1 flex gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl px-3 py-1 transition ${value === option.value ? "bg-white/20 text-white" : "text-slate-200 hover:bg-white/10"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DiffSummary({
  stats,
}: {
  stats: { totalChanges: number; additions: number; deletions: number; unchanged: number };
}) {
  return (
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-xl shadow-teal-900/20 md:grid-cols-4">
      <SummaryCard label="Changes" value={stats.totalChanges} accent="text-white" />
      <SummaryCard label="Additions" value={stats.additions} accent="text-emerald-300" />
      <SummaryCard label="Deletions" value={stats.deletions} accent="text-rose-300" />
      <SummaryCard label="Unchanged" value={stats.unchanged} accent="text-slate-300" />
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value.toLocaleString()}</p>
    </div>
  );
}

function DiffViewer({ diff, base, target, view }: { diff: DiffLine[]; base: string; target: string; view: "split" | "unified" }) {
  if (diff.length === 0) {
    return <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">No differences detected.</p>;
  }

  if (view === "split") {
    return <SplitView diff={diff} base={base} target={target} />;
  }

  return <UnifiedView diff={diff} />;
}

function SplitView({ diff, base, target }: { diff: DiffLine[]; base: string; target: string }) {
  const baseLines = splitLinesWithEmpty(base);
  const targetLines = splitLinesWithEmpty(target);

  return (
    <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20 lg:grid-cols-2">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Base</h3>
        <pre className="mt-3 max-h-[24rem] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200 shadow-inner">
          {renderSide(diff, "base", (line, position) => {
            if (line.type === "added") return null;

            const lineNumber = line.indexA !== null ? line.indexA + 1 : position.index + 1;
            const value = line.type === "removed" ? line.value : baseLines[position.index] ?? "";

            position.index += 1;

            return <DiffLineRow key={`base-${position.rendered}`} type={line.type} value={value} lineNumber={lineNumber} />;
          })}
        </pre>
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Target</h3>
        <pre className="mt-3 max-h-[24rem] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200 shadow-inner">
          {renderSide(diff, "target", (line, position) => {
            if (line.type === "removed") return null;

            const lineNumber = line.indexB !== null ? line.indexB + 1 : position.index + 1;
            const value = line.type === "added" ? line.value : targetLines[position.index] ?? "";

            position.index += 1;

            return <DiffLineRow key={`target-${position.rendered}`} type={line.type} value={value} lineNumber={lineNumber} />;
          })}
        </pre>
      </div>
    </div>
  );
}

function UnifiedView({ diff }: { diff: DiffLine[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
      <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Unified diff</h3>
      <pre className="mt-3 max-h-[28rem] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200 shadow-inner">
        {diff.map((line, index) => (
          <DiffLineRow key={`unified-${index}`} type={line.type} value={line.value} lineNumber={null} />
        ))}
      </pre>
    </div>
  );
}

function DiffLineRow({
  type,
  value,
  lineNumber,
}: {
  type: DiffLine["type"];
  value: string;
  lineNumber: number | null;
}) {
  const styles =
    type === "added"
      ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/40"
      : type === "removed"
      ? "bg-rose-500/20 text-rose-100 border-rose-400/40"
      : "text-slate-200 border-transparent";

  const prefix = type === "added" ? "+" : type === "removed" ? "-" : " ";

  return (
    <div className={`flex gap-3 rounded-xl border px-3 py-1.5 font-mono text-[11px] leading-relaxed ${styles}`}>
      <span className="w-10 shrink-0 text-right text-slate-400">
        {lineNumber !== null ? lineNumber : ""}
      </span>
      <span className="w-3 text-center text-slate-500">{prefix}</span>
      <span className="whitespace-pre-wrap text-current">{value || " "}</span>
    </div>
  );
}

function splitLinesWithEmpty(value: string): string[] {
  return value.replace(/\r\n/g, "\n").split("\n");
}

type RenderPosition = { index: number; rendered: number };

function renderSide(diff: DiffLine[], side: "base" | "target", renderLine: (line: DiffLine, position: RenderPosition) => JSX.Element | null) {
  const position: RenderPosition = { index: 0, rendered: 0 };

  return diff.map((line, diffIndex) => {
    const element = renderLine(line, position);
    if (element) {
      position.rendered += 1;
      return element;
    }

    if ((side === "base" && line.type !== "added") || (side === "target" && line.type !== "removed")) {
      position.index += 1;
    }

    return null;
  });
}

