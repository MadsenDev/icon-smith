import { useMemo, useState } from "react";

type FontOption = {
  label: string;
  stack: string;
};

const headingFonts: FontOption[] = [
  { label: "Inter (sans)", stack: '"Inter", "Segoe UI", sans-serif' },
  { label: "Space Grotesk", stack: '"Space Grotesk", "Segoe UI", sans-serif' },
  { label: "Playfair Display", stack: '"Playfair Display", "Georgia", serif' },
  { label: "DM Serif Display", stack: '"DM Serif Display", "Georgia", serif' },
  { label: "Fira Code", stack: '"Fira Code", "JetBrains Mono", monospace' },
];

const bodyFonts: FontOption[] = [
  { label: "Inter", stack: '"Inter", "Segoe UI", sans-serif' },
  { label: "Source Sans 3", stack: '"Source Sans 3", "Segoe UI", sans-serif' },
  { label: "IBM Plex Sans", stack: '"IBM Plex Sans", "Helvetica Neue", sans-serif' },
  { label: "Crimson Text", stack: '"Crimson Text", Georgia, serif' },
  { label: "Literata", stack: '"Literata", Georgia, serif' },
  { label: "Fira Code", stack: '"Fira Code", "JetBrains Mono", monospace' },
];

const ratioPresets = [
  { label: "Minor third", value: 1.2 },
  { label: "Major third", value: 1.25 },
  { label: "Perfect fourth", value: 1.333 },
  { label: "Augmented fourth", value: 1.414 },
  { label: "Golden ratio", value: 1.618 },
];

type ScaleStep = {
  step: number;
  rem: number;
  px: number;
};

function buildScale(basePx: number, ratio: number, below: number, above: number): ScaleStep[] {
  const steps: ScaleStep[] = [];
  for (let index = below; index <= above; index += 1) {
    const px = basePx * ratio ** index;
    const rem = px / 16;
    steps.push({ step: index, rem: Number.parseFloat(rem.toFixed(3)), px: Number.parseFloat(px.toFixed(2)) });
  }
  return steps;
}

export default function TypographySmithPage() {
  const [headingFont, setHeadingFont] = useState(headingFonts[0].stack);
  const [bodyFont, setBodyFont] = useState(bodyFonts[0].stack);
  const [ratio, setRatio] = useState(1.25);
  const [baseSize, setBaseSize] = useState(16);
  const [stepsAbove, setStepsAbove] = useState(4);
  const [stepsBelow, setStepsBelow] = useState(2);

  const scale = useMemo(() => buildScale(baseSize, ratio, -stepsBelow, stepsAbove), [baseSize, ratio, stepsAbove, stepsBelow]);

  const headingFontLabel = useMemo(() => headingFonts.find((font) => font.stack === headingFont)?.label ?? "Custom", [headingFont]);
  const bodyFontLabel = useMemo(() => bodyFonts.find((font) => font.stack === bodyFont)?.label ?? "Custom", [bodyFont]);

  const cssExport = useMemo(() => {
    const headingLine = `  --font-heading: ${headingFont};`;
    const bodyLine = `  --font-body: ${bodyFont};`;
    const baseLine = `  --font-base: ${baseSize}px;`;
    const ratioLine = `  --font-scale-ratio: ${ratio};`;
    const stepLines = scale
      .map((step) => `  --step-${step.step >= 0 ? `plus-${step.step}` : `minus-${Math.abs(step.step)}`}: ${step.rem}rem;`)
      .join("\n");

    return `:root {\n${headingLine}\n${bodyLine}\n${baseLine}\n${ratioLine}\n${stepLines}\n}`;
  }, [baseSize, bodyFont, headingFont, ratio, scale]);

  const sampleHeading = "Design delightful typography";
  const sampleSubheading = "Scale every breakpoint in a single click";
  const sampleBody =
    "Smith Suite’s typographic engine helps you explore pairings, line lengths, and responsive steps without leaving the browser.";

  const maxWidth = Math.min(60, Math.max(36, Math.round((scale[scale.length - 1]?.px ?? baseSize) / 1.6)));

  return (
    <div className="space-y-10 text-slate-200">
      <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Font pairing</p>
            <h2 className="text-xl font-semibold text-white">Dial in headings and body copy</h2>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Heading font</span>
              <select
                value={headingFont}
                onChange={(event) => setHeadingFont(event.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              >
                {headingFonts.map((font) => (
                  <option key={font.stack} value={font.stack}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Body font</span>
              <select
                value={bodyFont}
                onChange={(event) => setBodyFont(event.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              >
                {bodyFonts.map((font) => (
                  <option key={font.stack} value={font.stack}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Base size (px)</span>
              <input
                type="number"
                min={12}
                max={24}
                value={baseSize}
                onChange={(event) => setBaseSize(Math.max(12, Math.min(24, Number.parseInt(event.target.value, 10) || 16)))}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Scale ratio</span>
              <select
                value={ratio}
                onChange={(event) => setRatio(Number.parseFloat(event.target.value))}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              >
                {ratioPresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Steps above</span>
              <input
                type="number"
                min={1}
                max={8}
                value={stepsAbove}
                onChange={(event) => setStepsAbove(Math.max(1, Math.min(8, Number.parseInt(event.target.value, 10) || 4)))}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Steps below</span>
              <input
                type="number"
                min={0}
                max={4}
                value={stepsBelow}
                onChange={(event) => setStepsBelow(Math.max(0, Math.min(4, Number.parseInt(event.target.value, 10) || 2)))}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              />
            </label>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-300">
            <p className="font-medium text-slate-100">Pairing summary</p>
            <p className="mt-1">Headings use <span className="text-cyan-200">{headingFontLabel}</span>; body copy uses <span className="text-cyan-200">{bodyFontLabel}</span>.</p>
            <p className="mt-1">Base size {baseSize}px with a {ratio.toFixed(3)}× ratio.</p>
          </div>
        </div>
        <div
          className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20"
          style={{
            fontFamily: bodyFont,
            maxWidth: `${maxWidth}ch`,
          }}
        >
          <header className="space-y-2" style={{ fontFamily: headingFont }}>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Live specimen</p>
            <h1
              className="text-white"
              style={{ fontSize: `${scale.find((step) => step.step === stepsAbove)?.rem ?? 2.5}rem`, lineHeight: 1.1 }}
            >
              {sampleHeading}
            </h1>
            <h2 className="text-slate-200" style={{ fontSize: `${scale.find((step) => step.step === 1)?.rem ?? 1.6}rem` }}>
              {sampleSubheading}
            </h2>
          </header>
          <p className="text-slate-200" style={{ fontSize: `${scale.find((step) => step.step === 0)?.rem ?? 1}rem`, lineHeight: 1.6 }}>
            {sampleBody}
          </p>
          <p className="text-slate-400" style={{ fontSize: `${scale.find((step) => step.step === -1)?.rem ?? 0.875}rem`, lineHeight: 1.6 }}>
            Add supporting copy, captions, or metadata using the smaller steps in your scale. Every measurement above is generated
            from your base size and ratio.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Responsive scale</p>
            <h2 className="text-xl font-semibold text-white">Steps generated from base size</h2>
          </header>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-slate-300">
                <tr>
                  <th className="px-4 py-2">Step</th>
                  <th className="px-4 py-2">REM</th>
                  <th className="px-4 py-2">Pixels</th>
                  <th className="px-4 py-2">Use for</th>
                </tr>
              </thead>
              <tbody>
                {scale.map((item) => (
                  <tr key={item.step} className="odd:bg-white/5">
                    <td className="px-4 py-2 font-mono text-xs text-slate-400">{item.step}</td>
                    <td className="px-4 py-2 font-mono text-xs text-cyan-200">{item.rem}</td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-200">{item.px}</td>
                    <td className="px-4 py-2 text-xs text-slate-300">
                      {item.step > 2 && "Hero / display"}
                      {item.step === 2 && "H1"}
                      {item.step === 1 && "H2"}
                      {item.step === 0 && "Body"}
                      {item.step === -1 && "Caption"}
                      {item.step < -1 && "Micro copy"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">CSS export</p>
            <h2 className="text-xl font-semibold text-white">Drop the scale into tokens</h2>
          </header>
          <pre className="max-h-72 overflow-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-200">
            <code>{cssExport}</code>
          </pre>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(cssExport).catch(() => {})}
            className="inline-flex items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100 transition hover:bg-cyan-500/30"
          >
            Copy CSS variables
          </button>
        </div>
      </section>
    </div>
  );
}
