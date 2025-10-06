import { useMemo, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const ruleTemplates = [
  {
    id: "kebab",
    label: "kebab-case",
    description: "lowercase with hyphens",
    transform: (input: string) =>
      input
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase(),
  },
  {
    id: "snake",
    label: "snake_case",
    description: "lowercase with underscores",
    transform: (input: string) =>
      input
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase(),
  },
  {
    id: "camel",
    label: "camelCase",
    description: "lowerCamelCase",
    transform: (input: string) => {
      const cleaned = input
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((chunk) => chunk.toLowerCase());
      if (cleaned.length === 0) return "";
      return cleaned[0] + cleaned.slice(1).map(capitalise).join("");
    },
  },
  {
    id: "pascal",
    label: "PascalCase",
    description: "UpperCamelCase",
    transform: (input: string) =>
      input
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((chunk) => capitalise(chunk.toLowerCase()))
        .join(""),
  },
];

type RenameResult = {
  original: string;
  renamed: string;
  extension: string;
};

export default function RenameSmithPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [ruleId, setRuleId] = useState(ruleTemplates[0].id);
  const [applyCaseRule, setApplyCaseRule] = useState(true);
  const [startIndex, setStartIndex] = useState(1);
  const [padding, setPadding] = useState(2);
  const [replaceFrom, setReplaceFrom] = useState("");
  const [replaceTo, setReplaceTo] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [replaceCaseSensitive, setReplaceCaseSensitive] = useState(false);
  const [replaceOriginalOnly, setReplaceOriginalOnly] = useState(false);

  const activeRule = ruleTemplates.find((rule) => rule.id === ruleId) ?? ruleTemplates[0];

  const results = useMemo<RenameResult[]>(() => {
    return files.map((file, index) => {
      const base = file.name.replace(/\.[^/.]+$/, "");
      const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".") + 1) : "";

      const replaced = applyReplace(base, replaceFrom, replaceTo, useRegex, replaceCaseSensitive);
      const transformed = applyCaseRule ? activeRule.transform(replaced) : replaced;
      const selectedBase = replaceOriginalOnly ? base : transformed;

      const numerical = (startIndex + index).toString().padStart(Math.max(padding, 0), "0");
      const segments = [prefix, selectedBase, suffix].filter(Boolean);
      const renamedCore = segments.length > 0 ? segments.join("-") : selectedBase;
      const renamed = [renamedCore, numerical].filter(Boolean).join(segments.length > 0 ? "-" : "");

      return {
        original: file.name,
        renamed: extension ? `${renamed}.${extension}` : renamed,
        extension,
      };
    });
  }, [files, activeRule, prefix, suffix, startIndex, padding, replaceFrom, replaceTo, useRegex, replaceCaseSensitive, replaceOriginalOnly, applyCaseRule]);

  async function onSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) {
      setFiles(selected);
    }
    e.target.value = "";
  }

  async function downloadZip() {
    if (files.length === 0) return;
    const zip = new JSZip();
    await Promise.all(
      files.map(async (file, index) => {
        const target = results[index];
        const buffer = await file.arrayBuffer();
        zip.file(target.renamed, buffer);
      }),
    );
    const out = await zip.generateAsync({ type: "blob" });
    saveAs(out, "rename-smith.zip");
  }

  function copyList(format: "json" | "plain") {
    if (results.length === 0) return;
    let text = "";
    if (format === "json") {
      text = JSON.stringify(results.map(({ original, renamed }) => ({ original, renamed })), null, 2);
    } else {
      text = results.map(({ original, renamed }) => `${original} → ${renamed}`).join("\n");
    }
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">RenameSmith</h1>
            <p className="text-sm text-slate-200/80">
              Batch rename files with prefix/suffix, casing rules, find & replace, and sequential numbering. Copy a mapping or download renamed assets.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <label className="group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500/80 via-blue-500/80 to-purple-500/80 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
              <span className="z-10">{files.length ? `${files.length} files selected` : "Select files"}</span>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition group-hover:opacity-100" />
              <input type="file" multiple className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={onSelectFiles} />
            </label>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
              onClick={downloadZip}
              disabled={files.length === 0}
            >
              Download ZIP
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
              onClick={() => copyList("json")}
              disabled={files.length === 0}
            >
              Copy JSON
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20 disabled:opacity-50"
              onClick={() => copyList("plain")}
              disabled={files.length === 0}
            >
              Copy list
            </button>
          </div>
        </div>
      </div>

      <section className="grid flex-1 gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Rules</h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Case style</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ruleTemplates.map((rule) => (
                    <button
                      key={rule.id}
                      type="button"
                      className={`rounded-2xl border px-4 py-3 text-left text-xs transition ${
                        ruleId === rule.id ? "border-cyan-300 bg-cyan-500/30 text-white" : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                      }`}
                      onClick={() => setRuleId(rule.id)}
                    >
                      <span className="font-semibold">{rule.label}</span>
                      <span className="mt-1 block text-[11px] text-slate-200/70">{rule.description}</span>
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-200/80">
                  <input
                    type="checkbox"
                    checked={applyCaseRule}
                    onChange={(e) => setApplyCaseRule(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Apply case rule (disable to keep original casing)
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Prefix</span>
                <input
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Suffix</span>
                <input
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                />
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
                <p className="uppercase tracking-[0.35em] text-cyan-200/80">Find & replace</p>
                <div className="mt-3 grid gap-3">
                  <input
                    placeholder="Find"
                    value={replaceFrom}
                    onChange={(e) => setReplaceFrom(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                  />
                  <input
                    placeholder="Replace with"
                    value={replaceTo}
                    onChange={(e) => setReplaceTo(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.3em] text-slate-200/80">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} className="h-4 w-4" />
                      Regex
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={replaceCaseSensitive}
                        onChange={(e) => setReplaceCaseSensitive(e.target.checked)}
                        className="h-4 w-4"
                      />
                      Case sensitive
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={replaceOriginalOnly}
                        onChange={(e) => setReplaceOriginalOnly(e.target.checked)}
                        className="h-4 w-4"
                      />
                      Replace only original (ignore prefixes/suffixes)
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                  Start index
                  <input
                    type="number"
                    min={0}
                    value={startIndex}
                    onChange={(e) => setStartIndex(Number.isFinite(Number(e.target.value)) ? parseInt(e.target.value, 10) : 0)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                  />
                </label>
                <label className="block space-y-2 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                  Number padding
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={padding}
                    onChange={(e) => setPadding(Number.isFinite(Number(e.target.value)) ? parseInt(e.target.value, 10) : 0)}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-purple-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Tips</h2>
            <ul className="mt-4 space-y-2 text-[13px] text-slate-200/80">
              <li>• Combine prefix/suffix with numbering to align with design system or component naming.</li>
              <li>• Use snake_case for iOS asset catalogs, kebab-case for URLs, PascalCase for class names.</li>
              <li>• Use find & replace to strip redundant prefixes (e.g., "IMG_", "Screenshot") or update brand names.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Preview</h2>
          {files.length === 0 ? (
            <p className="mt-4 text-sm text-slate-200/70">Select files to see renaming preview.</p>
          ) : (
            <div className="mt-4 max-h-[420px] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-slate-100 shadow-inner shadow-black/40">
              <table className="w-full border-separate border-spacing-y-2">
                <thead className="text-xs uppercase tracking-[0.35em] text-slate-300/80">
                  <tr>
                    <th className="text-left">Original</th>
                    <th className="text-left">Renamed</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.original} className="text-xs text-slate-100">
                      <td className="rounded-l-xl bg-white/5 px-4 py-2">{result.original}</td>
                      <td className="rounded-r-xl bg-white/10 px-4 py-2 font-mono text-[13px] text-cyan-100">{result.renamed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function applyReplace(
  value: string,
  from: string,
  to: string,
  regex: boolean,
  caseSensitive: boolean,
): string {
  if (!from) return value;
  if (regex) {
    try {
      const flags = caseSensitive ? "g" : "gi";
      const pattern = new RegExp(from, flags);
      return value.replace(pattern, to);
    } catch {
      return value;
    }
  }
  const search = caseSensitive ? from : from.toLowerCase();
  let working = value;
  const replacement = caseSensitive ? to : to.toLowerCase();
  const haystack = caseSensitive ? working : working.toLowerCase();
  let index = haystack.indexOf(search);
  while (index !== -1) {
    working = working.slice(0, index) + to + working.slice(index + from.length);
    const nextStart = index + to.length;
    const nextHaystack = caseSensitive ? working : working.toLowerCase();
    index = nextHaystack.indexOf(search, nextStart);
  }
  return working;
}
