import { useMemo, useState } from "react";
import { replaceRegex, sanitizeFlags, testRegex } from "../utils/regex";

type TabKey = "tester" | "replace" | "explain";

const sampleInputs: Record<string, string> = {
  emails: "Contact us at support@example.com or sales@example.co.uk for details.",
  urls: "Visit https://iconsmith.dev or http://localhost:5173 for live demos.",
  csv: "id,name,role\n1,Chris,Designer\n2,Ada,Engineer",
  code: "const pattern = /foo(bar)?/gi; // sample regex",
};

export default function RegexSmithPage() {
  const [pattern, setPattern] = useState<string>("\\b([A-Z][a-z]+)\\b");
  const [flags, setFlags] = useState<string>("g");
  const [input, setInput] = useState<string>(sampleInputs.emails);
  const [replacement, setReplacement] = useState<string>("<$1>");
  const [activeTab, setActiveTab] = useState<TabKey>("tester");
  const [selectedSample, setSelectedSample] = useState<string>("emails");

  const sanitizedFlags = useMemo(() => sanitizeFlags(flags), [flags]);

  const { results, error } = useMemo(() => {
    return testRegex(pattern, sanitizedFlags, input, 2000);
  }, [pattern, sanitizedFlags, input]);

  const replacementOutput = useMemo(() => {
    return replaceRegex(pattern, sanitizedFlags, input, replacement);
  }, [pattern, sanitizedFlags, input, replacement]);

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">RegexSmith</h1>
            <p className="text-sm text-slate-200/80">
              Experiment with regular expressions, preview matches, generate replacements, and copy-ready code snippets.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(sampleInputs).map(([key, sample]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setInput(sample);
                  setSelectedSample(key);
                }}
                className={`rounded-full border px-4 py-1 uppercase tracking-[0.3em] transition ${
                  selectedSample === key ? "border-cyan-400/60 bg-cyan-500/15 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Pattern</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
              <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
                <span className="uppercase tracking-[0.35em] text-cyan-200/80">Regex</span>
                <input
                  value={pattern}
                  onChange={(event) => setPattern(event.target.value)}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  placeholder="Enter pattern"
                />
              </label>
              <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
                <span className="uppercase tracking-[0.35em] text-cyan-200/80">Flags</span>
                <input
                  value={flags}
                  onChange={(event) => setFlags(event.target.value)}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  placeholder="e.g. gim"
                />
                <p className="text-xs text-slate-400">Current: {sanitizedFlags || "—"}</p>
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Input</h2>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="mt-4 h-48 w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-slate-100 focus:outline-none"
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20 backdrop-blur">
            <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />
            <div className="mt-4">
              {activeTab === "tester" && <TesterPanel results={results} error={error} input={input} />}
              {activeTab === "replace" && (
                <ReplacePanel
                  replacement={replacement}
                  onReplacementChange={setReplacement}
                  output={replacementOutput.output}
                  error={replacementOutput.error}
                />
              )}
              {activeTab === "explain" && <ExplainPanel pattern={pattern} flags={sanitizedFlags} />}
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-xl shadow-teal-900/20">
            <h2 className="text-sm font-semibold text-white">Flag legend</h2>
            <ul className="mt-3 space-y-1">
              <li><strong className="text-white">g</strong> Global — find all matches</li>
              <li><strong className="text-white">i</strong> Ignore case</li>
              <li><strong className="text-white">m</strong> Multiline `^` and `$`</li>
              <li><strong className="text-white">s</strong> Dotall, dot matches newline</li>
              <li><strong className="text-white">u</strong> Unicode mode</li>
              <li><strong className="text-white">y</strong> Sticky, start at last index</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-xl shadow-blue-900/20">
            <h2 className="text-sm font-semibold text-white">Tips</h2>
            <ul className="mt-3 space-y-2">
              <li>• Use capture groups `( )` and reference them in replacements with `$1`, `$2`, ...</li>
              <li>• Enter `(?:...)` for non-capturing groups when you only need grouping.</li>
              <li>• `(?&lt;name&gt;...)` enables named groups — accessible via `$&lt;name&gt;` replacements.</li>
              <li>• For multi-line input, add the `m` flag to match at line boundaries.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TabSwitcher({ activeTab, onChange }: { activeTab: TabKey; onChange: (tab: TabKey) => void }) {
  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "tester", label: "Match tester" },
    { key: "replace", label: "Find & replace" },
    { key: "explain", label: "Explain" },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-full border px-4 py-1 text-xs uppercase tracking-[0.3em] transition ${
            activeTab === tab.key ? "border-cyan-400/60 bg-cyan-500/15 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function TesterPanel({ results, error, input }: { results: ReturnType<typeof testRegex>["results"]; error?: { message: string }; input: string }) {
  if (error) {
    return <ErrorCallout message={error.message} />;
  }

  if (results.length === 0) {
    return <p className="text-sm text-slate-300">No matches found. Adjust your pattern or flags to find matches.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-300">{results.length.toLocaleString()} match{results.length === 1 ? "" : "es"} found.</p>
      <div className="overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-cyan-100 shadow-inner shadow-cyan-500/10">
        <HighlightedMatches input={input} results={results} />
      </div>
      <div className="space-y-2 text-xs text-slate-300">
        {results.slice(0, 20).map((result, index) => (
          <div key={`${result.index}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm text-white">Match {index + 1}</p>
            <p><span className="text-cyan-200">Value</span>: <span className="text-white">{result.fullMatch}</span></p>
            <p><span className="text-cyan-200">Index</span>: {result.index}</p>
            {result.groups.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-cyan-200">Groups:</p>
                <ul className="space-y-1">
                  {result.groups.map((group, idx) => (
                    <li key={idx} className="text-white">
                      ${idx + 1}: {group ?? <span className="text-slate-400">undefined</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HighlightedMatches({ input, results }: { input: string; results: ReturnType<typeof testRegex>["results"] }) {
  if (results.length === 0) return <pre>{input}</pre>;

  const segments: Array<{ text: string; matched: boolean }> = [];
  let cursor = 0;

  results.forEach((result) => {
    if (result.index > cursor) {
      segments.push({ text: input.slice(cursor, result.index), matched: false });
    }
    segments.push({ text: input.slice(result.index, result.index + result.fullMatch.length), matched: true });
    cursor = result.index + result.fullMatch.length;
  });

  if (cursor < input.length) {
    segments.push({ text: input.slice(cursor), matched: false });
  }

  return (
    <pre>
      {segments.map((segment, index) => (
        <span key={index} className={segment.matched ? "bg-cyan-500/30 text-white" : "text-slate-200"}>
          {segment.text}
        </span>
      ))}
    </pre>
  );
}

function ReplacePanel({
  replacement,
  onReplacementChange,
  output,
  error,
}: {
  replacement: string;
  onReplacementChange: (value: string) => void;
  output: string;
  error?: { message: string };
}) {
  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
        <span className="uppercase tracking-[0.35em] text-cyan-200/80">Replacement</span>
        <input
          value={replacement}
          onChange={(event) => onReplacementChange(event.target.value)}
          className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
        />
        <p className="text-xs text-slate-400">Use `$1`, `$&lt;name&gt;` for capture groups. `\$&` inserts the entire match.</p>
      </label>
      {error ? (
        <ErrorCallout message={error.message} />
      ) : (
        <textarea value={output} readOnly className="h-48 w-full rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-cyan-100 shadow-inner shadow-cyan-500/10" />
      )}
    </div>
  );
}

function ExplainPanel({ pattern, flags }: { pattern: string; flags: string }) {
  if (!pattern) {
    return <p className="text-sm text-slate-300">Enter a pattern to see a breakdown of its structure.</p>;
  }

  const parts = pattern
    .split(/(\(\?[:<!=][^)]*\)|\[[^\]]*\]|\\.|\(\?:|\(|\)|\^|\$|\.|\*|\+|\?|\||\{\d+,?\d*\})/)
    .filter(Boolean)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 text-sm text-slate-200">
      <p><span className="text-cyan-200">Flags</span>: {flags || "None"}</p>
      <div className="space-y-2 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200">
        {parts.map((part, index) => (
          <div key={`${part}-${index}`}>
            <span className="text-cyan-200">{part}</span>
            <span className="text-slate-400"> — {describePart(part)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function describePart(part: string): string {
  if (/^\\[dDsSwW]$/.test(part)) return "Character class shorthand";
  if (/^\\.$/.test(part)) return "Escaped literal";
  if (/^\.$/.test(part)) return "Any character";
  if (/^\^$/.test(part)) return "Start of string";
  if (/^\$$/.test(part)) return "End of string";
  if (/^\*$/.test(part)) return "Zero or more";
  if (/^\+$/.test(part)) return "One or more";
  if (/^\?$/.test(part)) return "Zero or one (optional)";
  if (/^\|$/.test(part)) return "Alternation";
  if (/^\(\?:/.test(part)) return "Non-capturing group";
  if (/^\(\?</.test(part)) return "Named capturing group";
  if (/^\($/.test(part)) return "Capturing group start";
  if (/^\)$/.test(part)) return "Group end";
  if (/^\[.*\]$/.test(part)) return "Character set";
  if (/^\{\d+,?\d*\}$/.test(part)) return "Quantifier";
  return "Literal";
}

function ErrorCallout({ message }: { message: string }) {
  return <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{message}</div>;
}

