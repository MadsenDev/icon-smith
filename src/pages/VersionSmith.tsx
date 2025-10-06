import { useMemo, useState } from "react";

type DiffKind = "added" | "removed" | "changed" | "nested";

type DiffItem = {
  path: string;
  kind: DiffKind;
  value?: unknown;
  previous?: unknown;
};

type MergeStrategy = "preferBase" | "preferIncoming" | "deep";

function safeParseJSON(input: string): { value: unknown; error: string | null } {
  if (!input.trim()) return { value: {}, error: null };
  try {
    return { value: JSON.parse(input), error: null };
  } catch (error) {
    return { value: null, error: (error as Error).message };
  }
}

function buildDiff(base: unknown, incoming: unknown, path: string[] = []): DiffItem[] {
  if (typeof base !== "object" || base === null) {
    if (typeof incoming !== "object" || incoming === null) {
      if (JSON.stringify(base) === JSON.stringify(incoming)) {
        return [];
      }
      return [
        {
          path: path.join("."),
          kind: "changed",
          previous: base,
          value: incoming,
        },
      ];
    }
    return [
      {
        path: path.join("."),
        kind: "changed",
        previous: base,
        value: incoming,
      },
    ];
  }

  if (typeof incoming !== "object" || incoming === null) {
    return [
      {
        path: path.join("."),
        kind: "changed",
        previous: base,
        value: incoming,
      },
    ];
  }

  if (Array.isArray(base) || Array.isArray(incoming)) {
    if (JSON.stringify(base) === JSON.stringify(incoming)) {
      return [];
    }
    return [
      {
        path: path.join("."),
        kind: "changed",
        previous: base,
        value: incoming,
      },
    ];
  }

  const diff: DiffItem[] = [];
  const baseKeys = new Set(Object.keys(base as Record<string, unknown>));
  const incomingKeys = new Set(Object.keys(incoming as Record<string, unknown>));
  const allKeys = new Set([...baseKeys, ...incomingKeys]);

  allKeys.forEach((key) => {
    const nextPath = [...path, key];
    if (!incomingKeys.has(key)) {
      diff.push({ path: nextPath.join("."), kind: "removed", previous: (base as Record<string, unknown>)[key] });
      return;
    }
    if (!baseKeys.has(key)) {
      diff.push({ path: nextPath.join("."), kind: "added", value: (incoming as Record<string, unknown>)[key] });
      return;
    }

    const baseValue = (base as Record<string, unknown>)[key];
    const incomingValue = (incoming as Record<string, unknown>)[key];

    if (typeof baseValue === "object" && baseValue !== null && typeof incomingValue === "object" && incomingValue !== null) {
      const nestedDiff = buildDiff(baseValue, incomingValue, nextPath);
      if (nestedDiff.length > 0) {
        diff.push({ path: nextPath.join("."), kind: "nested" });
        diff.push(...nestedDiff);
      }
    } else if (JSON.stringify(baseValue) !== JSON.stringify(incomingValue)) {
      diff.push({ path: nextPath.join("."), kind: "changed", previous: baseValue, value: incomingValue });
    }
  });

  return diff;
}

function mergeObjects(base: unknown, incoming: unknown, strategy: MergeStrategy): unknown {
  if (strategy === "preferIncoming") return incoming;
  if (strategy === "preferBase") return base;

  if (typeof base !== "object" || base === null) return incoming;
  if (typeof incoming !== "object" || incoming === null) return incoming ?? base;

  if (Array.isArray(base) && Array.isArray(incoming)) {
    return incoming;
  }

  const result: Record<string, unknown> = { ...base };
  Object.entries(incoming as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined) return;
    result[key] = mergeObjects((base as Record<string, unknown>)[key], value, strategy);
  });
  return result;
}

function formatValue(value: unknown): string {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? JSON.stringify(value)
    : JSON.stringify(value, null, 2);
}

export default function VersionSmithPage() {
  const [baseInput, setBaseInput] = useState(() => `{
  "tokens": {
    "brand": "#0EA5E9",
    "spacing": [4, 8, 12, 16]
  },
  "locales": {
    "en": "Hello",
    "fr": "Bonjour"
  }
}`);
  const [incomingInput, setIncomingInput] = useState(() => `{
  "tokens": {
    "brand": "#22D3EE",
    "radius": 12,
    "spacing": [4, 8, 16, 24]
  },
  "locales": {
    "en": "Hello",
    "de": "Hallo"
  }
}`);
  const [strategy, setStrategy] = useState<MergeStrategy>("deep");

  const parsedBase = useMemo(() => safeParseJSON(baseInput), [baseInput]);
  const parsedIncoming = useMemo(() => safeParseJSON(incomingInput), [incomingInput]);

  const diff = useMemo(() => {
    if (parsedBase.error || parsedIncoming.error) return [];
    return buildDiff(parsedBase.value, parsedIncoming.value);
  }, [parsedBase, parsedIncoming]);

  const summary = useMemo(() => {
    const counts = diff.reduce(
      (acc, item) => {
        acc[item.kind] += 1;
        return acc;
      },
      { added: 0, removed: 0, changed: 0, nested: 0 } as Record<DiffKind, number>,
    );
    return counts;
  }, [diff]);

  const merged = useMemo(() => {
    if (parsedBase.error || parsedIncoming.error) return null;
    return mergeObjects(parsedBase.value, parsedIncoming.value, strategy);
  }, [parsedBase, parsedIncoming, strategy]);

  return (
    <div className="space-y-10 text-slate-200">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Base snapshot</p>
            <h2 className="text-xl font-semibold text-white">Source of truth</h2>
          </header>
          <textarea
            value={baseInput}
            onChange={(event) => setBaseInput(event.target.value)}
            rows={14}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400/60"
          />
          {parsedBase.error && (
            <p className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-3 py-2 text-xs text-rose-100">
              {parsedBase.error}
            </p>
          )}
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Incoming snapshot</p>
            <h2 className="text-xl font-semibold text-white">Candidate changes</h2>
          </header>
          <textarea
            value={incomingInput}
            onChange={(event) => setIncomingInput(event.target.value)}
            rows={14}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400/60"
          />
          {parsedIncoming.error && (
            <p className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-3 py-2 text-xs text-rose-100">
              {parsedIncoming.error}
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Diff summary</p>
            <h2 className="text-xl font-semibold text-white">What changed?</h2>
          </header>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-cyan-100">
              Added
              <p className="text-lg font-semibold text-white">{summary.added}</p>
            </div>
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-rose-100">
              Removed
              <p className="text-lg font-semibold text-white">{summary.removed}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-amber-100">
              Changed
              <p className="text-lg font-semibold text-white">{summary.changed}</p>
            </div>
            <div className="rounded-2xl border border-slate-400/40 bg-slate-500/20 px-3 py-2 text-slate-100">
              Nested updates
              <p className="text-lg font-semibold text-white">{summary.nested}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">
            <p className="font-medium text-slate-100">Merge strategy</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["preferBase", "preferIncoming", "deep"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStrategy(option as MergeStrategy)}
                  className={`rounded-full border px-3 py-1 uppercase tracking-[0.35em] transition ${
                    strategy === option
                      ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100"
                      : "border-white/10 bg-white/10 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-100"
                  }`}
                >
                  {option === "preferBase" && "Keep base"}
                  {option === "preferIncoming" && "Take incoming"}
                  {option === "deep" && "Deep merge"}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-slate-500">
              Deep merge keeps nested objects, preferring incoming values.
            </p>
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Diff details</p>
            <h2 className="text-xl font-semibold text-white">Line-by-line overview</h2>
          </header>
          <div className="space-y-3 text-xs">
            {diff.length === 0 && (
              <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-emerald-100">No differences detected.</p>
            )}
            {diff.map((item) => (
              <div
                key={`${item.path}-${item.kind}-${formatValue(item.value)}-${formatValue(item.previous)}`}
                className={`rounded-2xl border px-4 py-3 ${
                  item.kind === "added"
                    ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100"
                    : item.kind === "removed"
                    ? "border-rose-400/40 bg-rose-500/20 text-rose-100"
                    : item.kind === "nested"
                    ? "border-slate-400/40 bg-slate-500/20 text-slate-100"
                    : "border-amber-400/40 bg-amber-500/15 text-amber-100"
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/70">{item.kind}</p>
                <p className="font-semibold text-white">{item.path || "(root)"}</p>
                {item.kind !== "nested" && item.previous !== undefined && (
                  <pre className="mt-2 overflow-auto rounded-xl border border-white/10 bg-slate-950/70 p-3 text-[11px] text-slate-200">
                    <code>{formatValue(item.previous)}</code>
                  </pre>
                )}
                {item.kind !== "nested" && item.value !== undefined && (
                  <pre className="mt-2 overflow-auto rounded-xl border border-white/10 bg-slate-950/70 p-3 text-[11px] text-slate-200">
                    <code>{formatValue(item.value)}</code>
                  </pre>
                )}
                {item.kind === "nested" && (
                  <p className="mt-2 text-[11px] text-slate-200/80">
                    Nested differences detected deeper in this branch.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {merged && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Merged output</p>
            <h2 className="text-xl font-semibold text-white">Resulting snapshot</h2>
          </header>
          <pre className="mt-4 max-h-80 overflow-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-200">
            <code>{JSON.stringify(merged, null, 2)}</code>
          </pre>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(merged, null, 2)).catch(() => {})}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100 transition hover:bg-cyan-500/30"
          >
            Copy merged JSON
          </button>
        </section>
      )}
    </div>
  );
}
