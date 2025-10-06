import { useMemo, useState } from "react";
import { saveAs } from "file-saver";

type Framework = "jest" | "vitest";

const sampleFunction = `export function add(a: number, b: number) {
  return a + b;
}`;

export default function TestSmithPage() {
  const [source, setSource] = useState(sampleFunction);
  const [functionName, setFunctionName] = useState("add");
  const [framework, setFramework] = useState<Framework>("vitest");
  const [cases, setCases] = useState("2, 3 -> 5\n-1, 4 -> 3");

  const parsedCases = useMemo(() => parseCaseTable(cases), [cases]);
  const testFile = useMemo(() => buildTestFile({ framework, functionName, parsedCases }), [framework, functionName, parsedCases]);

  const download = () => {
    const blob = new Blob([testFile], { type: "text/plain" });
    saveAs(blob, `${functionName}.${framework}.test.ts`);
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">TestSmith</h1>
            <p className="text-sm text-slate-200/80">
              Generate test boilerplate for Vitest or Jest from function signatures and tabular edge cases.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-200">
            <button
              type="button"
              onClick={download}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 uppercase tracking-[0.35em] transition hover:bg-white/20"
            >
              Download test file
            </button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20">
            <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Function under test</h2>
            <textarea
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="h-48 w-full rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-slate-100 outline-none"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                Function name
                <input
                  value={functionName}
                  onChange={(event) => setFunctionName(event.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                Framework
                <select
                  value={framework}
                  onChange={(event) => setFramework(event.target.value as Framework)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="vitest">Vitest</option>
                  <option value="jest">Jest</option>
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20">
            <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Case table</h2>
            <p className="text-xs text-slate-300">Format: <code className="rounded bg-white/10 px-1">arg1, arg2 -&gt; expected</code>, one per line.</p>
            <textarea
              value={cases}
              onChange={(event) => setCases(event.target.value)}
              className="h-32 w-full rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-slate-100 outline-none"
            />
            <div className="text-xs text-slate-300">
              <p>Parsed cases:</p>
              <ul className="mt-2 space-y-1">
                {parsedCases.map((testCase, index) => (
                  <li key={index} className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1">
                    {`${testCase.args.join(", ")} → ${testCase.expected}`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <ExportBlock title="Generated tests" code={testFile} />
          <ExportBlock title="JSON schema" code={jsonExport(parsedCases, functionName)} />
        </aside>
      </div>
    </div>
  );
}

function ExportBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-teal-900/20">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">Export</p>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(code).catch(() => {})}
          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
        >
          Copy
        </button>
      </header>
      <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-900/80">
        <pre className="max-h-64 min-w-full px-4 py-4 text-xs text-slate-200">
          <code className="whitespace-pre-wrap break-words text-left">{code}</code>
        </pre>
      </div>
    </div>
  );
}

function parseCaseTable(input: string) {
  return input
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [left, expected] = line.split("->").map((part) => part.trim());
      const args = left.split(",").map((value) => value.trim());
      return { args, expected };
    });
}

function buildTestFile({ framework, functionName, parsedCases }: { framework: Framework; functionName: string; parsedCases: Array<{ args: string[]; expected: string }> }) {
  const importLine = framework === "vitest" ? "import { describe, expect, it } from \"vitest\";" : "import { describe, expect, it } from \"@jest/globals\";";
  const caseLines = parsedCases.length
    ? parsedCases
        .map((testCase) => {
          const formattedArgs = testCase.args.map(formatLiteral).join(", ");
          const formattedExpected = formatLiteral(testCase.expected);
          return `    [${formattedArgs}, ${formattedExpected}]`;
        })
        .join("\n")
    : "    // [arg1, arg2, expected]";

  const output: string[] = [];
  output.push(importLine);
  output.push(`import { ${functionName} } from \"./${functionName}\";`);
  output.push("");
  output.push(`describe('${functionName}', () => {`);
  output.push("  const cases = [");
  output.push(caseLines);
  output.push("  ];");
  output.push("");
  output.push("  cases.forEach((entry) => {");
  output.push("    const input = [...entry];");
  output.push("    const expected = input.pop();");
  output.push("");
  output.push("    it(\`returns \\${expected} for \\${input.join(', ')}\\`, () => {");
  output.push(`      expect(${functionName}(...input)).toEqual(expected);`);
  output.push("    });");
  output.push("  });");
  output.push("});");
  output.push("");

  return output.join("\n");
}

function jsonExport(parsedCases: Array<{ args: string[]; expected: string }>, functionName: string): string {
  const payload = {
    function: functionName,
    cases: parsedCases.map((testCase) => ({
      args: testCase.args,
      expected: testCase.expected,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

function formatLiteral(value: string): string {
  if (value === "true" || value === "false") return value;
  if (value === "null" || value === "undefined") return value;
  if (!Number.isNaN(Number(value))) return value;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" || Array.isArray(parsed)) {
      return JSON.stringify(parsed);
    }
  } catch (error) {
    // ignore malformed JSON strings
  }
  return `"${value.replace(/"/g, '\\"')}"`;
}

