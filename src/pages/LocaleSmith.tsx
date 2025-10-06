import { useMemo, useState } from "react";
import { saveAs } from "file-saver";

type Flattened = Record<string, string | number | boolean | null>;

type LocaleDiff = {
  missing: string[];
  extra: string[];
};

const defaultBase = `{
  "app": {
    "title": "IconSmith",
    "subtitle": "Pure resizing",
    "cta": "Generate ZIP"
  },
  "messages": {
    "success": "All assets exported.",
    "error": "Something went wrong"
  }
}`;

const defaultLocale = `{
  "app": {
    "title": "IconSmith",
    "cta": "ZIP erzeugen"
  },
  "messages": {
    "success": "Alle Assets exportiert."
  }
}`;

export default function LocaleSmithPage() {
  const [baseText, setBaseText] = useState(defaultBase);
  const [localeText, setLocaleText] = useState(defaultLocale);
  const [localeName, setLocaleName] = useState("de-DE");
  const { baseObj, localeObj, baseError, localeError } = useMemo(() => parseInputs(baseText, localeText), [baseText, localeText]);

  const diff: LocaleDiff | null = useMemo(() => {
    if (!baseObj || !localeObj) return null;
    const baseFlat = flatten(baseObj);
    const localeFlat = flatten(localeObj);
    const missing = Object.keys(baseFlat).filter((key) => !(key in localeFlat));
    const extra = Object.keys(localeFlat).filter((key) => !(key in baseFlat));
    return { missing, extra };
  }, [baseObj, localeObj]);

  function copyReport() {
    if (!diff) return;
    const report = [`Missing keys (${diff.missing.length}):`, ...diff.missing, "", `Extra keys (${diff.extra.length}):`, ...diff.extra].join("\n");
    navigator.clipboard.writeText(report).catch(() => {});
  }

  function downloadMerged() {
    if (!baseObj || !localeObj) return;
    const merged = mergeLocales(baseObj, localeObj);
    const blob = new Blob([JSON.stringify(merged, null, 2)], { type: "application/json" });
    saveAs(blob, `${localeName || "locale"}.json`);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">LocaleSmith</h1>
            <p className="text-sm text-slate-200/80">
              Compare base and translated JSON files. Highlight missing/extra keys, merge automatically, and export clean locales.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <input
              value={localeName}
              onChange={(e) => setLocaleName(e.target.value)}
              placeholder="Locale name (e.g. de-DE)"
              className="w-32 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs text-white focus:border-cyan-300 focus:outline-none"
            />
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
              onClick={copyReport}
              disabled={!diff}
            >
              Copy report
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
              onClick={downloadMerged}
              disabled={!diff}
            >
              Download merged
            </button>
          </div>
        </div>
      </div>

      <section className="grid flex-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <LocaleTextarea label="Base locale" value={baseText} onChange={setBaseText} error={baseError} />
          <LocaleTextarea label="Translated locale" value={localeText} onChange={setLocaleText} error={localeError} />
        </div>

        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Diff</h2>
          {!diff ? (
            <p className="text-sm text-slate-200/70">Paste valid JSON to view comparison results.</p>
          ) : (
            <div className="space-y-4">
              <DiffList title={`Missing keys (${diff.missing.length})`} items={diff.missing} tone="warning" />
              <DiffList title={`Extra keys (${diff.extra.length})`} items={diff.extra} tone="info" />
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
                <p className="font-semibold text-white">Tips</p>
                <ul className="mt-2 space-y-1 text-[11px]">
                  <li>• Missing keys were copied from the base locale when exporting merged JSON.</li>
                  <li>• Extra keys exist only in the translated file; ensure they are still required.</li>
                  <li>• Nested keys use dot notation (e.g. `messages.success`).</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type LocaleTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
};

function LocaleTextarea({ label, value, onChange, error }: LocaleTextareaProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-purple-900/20 backdrop-blur">
      <h2 className="text-lg font-semibold text-white">{label}</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-cyan-100 shadow-inner shadow-black/40 focus:border-cyan-300 focus:outline-none"
      />
      {error && <p className="mt-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">{error}</p>}
    </div>
  );
}

function DiffList({ title, items, tone }: { title: string; items: string[]; tone: "warning" | "info" }) {
  const emptyMessage = tone === "warning" ? "No missing keys." : "No extra keys.";
  const border = tone === "warning" ? "border-amber-400/40" : "border-cyan-400/40";
  const background = tone === "warning" ? "bg-amber-500/10" : "bg-cyan-500/10";

  return (
    <div className={`rounded-2xl border ${border} ${background} p-4 text-xs text-slate-900 dark:text-slate-50`}>
      <p className="font-semibold uppercase tracking-[0.35em]">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-[11px]">{emptyMessage}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-[11px]">
          {items.map((key) => (
            <li key={key} className="font-mono">{key}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function parseInputs(baseText: string, localeText: string) {
  let baseObj: Record<string, unknown> | null = null;
  let localeObj: Record<string, unknown> | null = null;
  let baseError: string | null = null;
  let localeError: string | null = null;

  try {
    baseObj = JSON.parse(baseText);
    if (typeof baseObj !== "object" || baseObj === null) throw new Error();
  } catch {
    baseError = "Base locale must be valid JSON.";
  }

  try {
    localeObj = JSON.parse(localeText);
    if (typeof localeObj !== "object" || localeObj === null) throw new Error();
  } catch {
    localeError = "Translated locale must be valid JSON.";
  }

  return { baseObj, localeObj, baseError, localeError };
}

function flatten(object: Record<string, unknown>, prefix = ""): Flattened {
  return Object.entries(object).reduce<Flattened>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(acc, flatten(value as Record<string, unknown>, path));
    } else {
      acc[path] = value as any;
    }
    return acc;
  }, {});
}

function mergeLocales(base: Record<string, unknown>, locale: Record<string, unknown>) {
  const result = structuredClone(locale);
  function apply(source: Record<string, unknown>, target: Record<string, unknown>) {
    Object.entries(source).forEach(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        apply(value as Record<string, unknown>, target[key] as Record<string, unknown>);
      } else if (!(key in target)) {
        target[key] = value;
      }
    });
  }
  apply(base, result);
  return result;
}
