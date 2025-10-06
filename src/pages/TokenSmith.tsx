import { useMemo, useState } from "react";

const presets = {
  tailwind: {
    label: "Tailwind",
    description: "Tailwind config snippet",
    convert: (tokens: TokenRecord[]) => tailwindTemplate(tokens),
  },
  css: {
    label: "CSS variables",
    description: "CSS variable block",
    convert: (tokens: TokenRecord[]) => cssVarTemplate(tokens),
  },
  json: {
    label: "JSON",
    description: "JSON tokens",
    convert: (tokens: TokenRecord[]) => JSON.stringify(tokens, null, 2),
  },
  styleDictionary: {
    label: "Style Dictionary",
    description: "SD token structure",
    convert: (tokens: TokenRecord[]) => styleDictionaryTemplate(tokens),
  },
};

type FormatKey = keyof typeof presets;

type TokenRecord = {
  name: string;
  value: string;
};

export default function TokenSmithPage() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<FormatKey>("tailwind");

  const { tokens, error } = useMemo(() => parseTokens(input), [input]);
  const output = tokens.length ? presets[format].convert(tokens) : "";

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">TokenSmith</h1>
            <p className="text-sm text-slate-200/80">
              Paste design tokens (JSON, CSS vars, Tailwind snippet) and convert them into other formats instantly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {(Object.entries(presets) as [FormatKey, typeof presets[FormatKey]][]).map(([key, value]) => (
              <button
                key={key}
                type="button"
                className={`rounded-full border px-4 py-2 uppercase tracking-[0.35em] transition ${
                  format === key ? "border-cyan-300 bg-cyan-500/30 text-white" : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                }`}
                onClick={() => setFormat(key)}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="grid flex-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Input tokens</h2>
          <textarea
            rows={16}
            placeholder="Paste JSON, Tailwind config snippet, or CSS variables"
            className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-cyan-100 shadow-inner shadow-black/40 focus:border-cyan-300 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">{error}</p>}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
            <p className="font-semibold text-white">Tips</p>
            <ul className="mt-2 space-y-1 text-[11px]">
              <li>
                • Accepts raw JSON arrays (e.g., <code>{`[{"name":"--color-primary","value":"#4F46E5"}]`}</code>)
              </li>
              <li>• Tailwind config snippet with <code>theme.extend.colors</code> will be parsed</li>
              <li>• CSS variables (e.g., <code>--color-primary:#4F46E5;</code>) are also supported</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-purple-900/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Output ({presets[format].description})</h2>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-cyan-100 shadow-inner shadow-black/40">
            <pre>{output}</pre>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white/20 disabled:opacity-50"
            onClick={() => navigator.clipboard.writeText(output)}
            disabled={!output}
          >
            Copy output
          </button>
        </div>
      </section>
    </div>
  );
}

function parseTokens(input: string): { tokens: TokenRecord[]; error: string | null } {
  if (!input.trim()) {
    return { tokens: [], error: null };
  }

  try {
    const json = JSON.parse(input);
    if (Array.isArray(json)) {
      const mapped = json
        .filter((entry) => typeof entry === "object" && entry !== null)
        .map((entry: any) => ({
          name: String(entry.name ?? entry.id ?? "token"),
          value: String(entry.value ?? entry.hex ?? entry.rgb ?? ""),
        }));
      return { tokens: mapped, error: null };
    }

    if (json.theme?.extend?.colors) {
      const tokens: TokenRecord[] = [];
      Object.entries(json.theme.extend.colors).forEach(([key, value]) => {
        if (typeof value === "string") {
          tokens.push({ name: key, value });
        } else if (typeof value === "object" && value !== null) {
          Object.entries(value).forEach(([shade, hex]) => {
            tokens.push({ name: `${key}-${shade}`, value: String(hex) });
          });
        }
      });
      return { tokens, error: null };
    }
  } catch {
    // ignore JSON parse failure and try other formats
  }

  const cssMatches = Array.from(input.matchAll(/--([\w-]+)\s*:\s*([^;]+);?/g)).map((match) => ({
    name: match[1],
    value: match[2].trim(),
  }));
  if (cssMatches.length > 0) {
    return { tokens: cssMatches, error: null };
  }

  return { tokens: [], error: "Unable to parse tokens. Provide valid JSON, Tailwind config, or CSS variables." };
}

function tailwindTemplate(tokens: TokenRecord[]): string {
  const entries = tokens
    .map((token) => `        "${token.name}": "${token.value}"`)
    .join(",\n");
  return `module.exports = {
  theme: {
    extend: {
      colors: {
${entries}
      }
    }
  }
};`;
}

function cssVarTemplate(tokens: TokenRecord[]): string {
  const entries = tokens.map((token) => `  --${token.name}: ${token.value};`).join("\n");
  return `:root {
${entries}
}`;
}

function styleDictionaryTemplate(tokens: TokenRecord[]): string {
  const obj: Record<string, { value: string }> = {};
  tokens.forEach((token) => {
    obj[token.name] = { value: token.value };
  });
  return JSON.stringify({ color: obj }, null, 2);
}
