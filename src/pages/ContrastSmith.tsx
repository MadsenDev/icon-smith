import { useMemo, useState } from "react";
import {
  bestOnBackground,
  contrastRatio,
  getContrastRating,
  parseColor,
  suggestAdjustments,
  toHex,
  type AdjustmentRecommendation,
  type ContrastRating,
} from "../utils/contrast";

type ColorPair = {
  id: string;
  label: string;
  foreground: string;
  background: string;
};

type PairAnalysis = {
  pair: ColorPair;
  ratio: number | null;
  rating: ContrastRating | null;
  passesAA: boolean;
  passesAAA: boolean;
  passesLarge: boolean;
  sampleFg: string;
  sampleBg: string;
  recommendations: AdjustmentRecommendation[];
  error?: string;
};

const DEFAULT_SAMPLE = "The quick brown fox jumps over the lazy dog";

const defaultPairs: ColorPair[] = [
  {
    id: createId(),
    label: "Primary on background",
    foreground: "#F8FAFC",
    background: "#0F172A",
  },
  {
    id: createId(),
    label: "Accent on slate",
    foreground: "#38BDF8",
    background: "#020617",
  },
  {
    id: createId(),
    label: "Muted text",
    foreground: "#94A3B8",
    background: "#0B1220",
  },
];

export default function ContrastSmithPage() {
  const [pairs, setPairs] = useState<ColorPair[]>(defaultPairs);
  const [sampleText, setSampleText] = useState(DEFAULT_SAMPLE);

  const analyses = useMemo<PairAnalysis[]>(() => {
    return pairs.map((pair) => {
      const fg = parseColor(pair.foreground);
      const bg = parseColor(pair.background);
      if (!fg || !bg) {
        return {
          pair,
          ratio: null,
          rating: null,
          passesAA: false,
          passesAAA: false,
          passesLarge: false,
          sampleFg: pair.foreground,
          sampleBg: pair.background,
          recommendations: [],
          error: "Invalid colour. Use hex like #0EA5E9 or rgb(14,165,233).",
        } satisfies PairAnalysis;
      }

      const ratio = Number(contrastRatio(fg, bg).toFixed(2));
      const rating = getContrastRating(ratio);
      const passesAA = ratio >= 4.5;
      const passesAAA = ratio >= 7;
      const passesLarge = ratio >= 3;
      const recommendations = suggestAdjustments(fg, bg).slice(0, 3);
      const best = bestOnBackground(bg);

      return {
        pair,
        ratio,
        rating,
        passesAA,
        passesAAA,
        passesLarge,
        sampleFg: toHex(fg),
        sampleBg: toHex(bg),
        recommendations:
          recommendations.length > 0
            ? recommendations
            : [
                {
                  target: "foreground",
                  direction: "lighten",
                  ratio: best.ratio,
                  color: toHex(best.color),
                  goal: best.rating,
                },
              ],
      } satisfies PairAnalysis;
    });
  }, [pairs]);

  function updatePair(id: string, patch: Partial<ColorPair>) {
    setPairs((prev) => prev.map((pair) => (pair.id === id ? { ...pair, ...patch } : pair)));
  }

  function removePair(id: string) {
    setPairs((prev) => prev.filter((pair) => pair.id !== id));
  }

  function duplicatePair(id: string) {
    setPairs((prev) => {
      const source = prev.find((pair) => pair.id === id);
      if (!source) return prev;
      const copy: ColorPair = {
        ...source,
        id: createId(),
        label: `${source.label} copy`,
      };
      const index = prev.findIndex((pair) => pair.id === id);
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  }

  function addPair() {
    setPairs((prev) => [
      ...prev,
      {
        id: createId(),
        label: `Pair ${prev.length + 1}`,
        foreground: "#FFFFFF",
        background: "#0F172A",
      },
    ]);
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">ContrastSmith</h1>
            <p className="text-sm text-slate-200/80">
              Check colour contrast against WCAG AA/AAA targets, explore adjustments, and preview copy on real backgrounds.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={addPair}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20"
            >
              Add pair
            </button>
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-slate-200/70">
              <span className="uppercase tracking-[0.35em] text-cyan-200/80">Sample text</span>
              <input
                value={sampleText}
                onChange={(event) => setSampleText(event.target.value)}
                className="w-48 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Enter copy"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          {analyses.map((analysis) => {
            const { pair } = analysis;
            return (
              <article
                key={pair.id}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/15 transition hover:-translate-y-[2px] hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" aria-hidden="true" />
                <div className="relative z-10 space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <input
                      value={pair.label}
                      onChange={(event) => updatePair(pair.id, { label: event.target.value })}
                      className="text-lg font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    />
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => duplicatePair(pair.id)}
                        className="rounded-full border border-white/10 px-4 py-1 uppercase tracking-[0.35em] text-slate-200/80 transition hover:bg-white/10"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => removePair(pair.id)}
                        className="rounded-full border border-white/10 px-4 py-1 uppercase tracking-[0.35em] text-rose-200/80 transition hover:bg-rose-500/20"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <ColourInput
                      label="Foreground"
                      value={pair.foreground}
                      onChange={(value) => updatePair(pair.id, { foreground: value })}
                    />
                    <ColourInput
                      label="Background"
                      value={pair.background}
                      onChange={(value) => updatePair(pair.id, { background: value })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
                    <PreviewPanel
                      sampleText={sampleText}
                      analysis={analysis}
                    />
                    <MetricsPanel analysis={analysis} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="flex flex-col gap-6">
          <GuidelinesCard />
          <TipsCard analyses={analyses} />
        </aside>
      </div>
    </div>
  );
}

function ColourInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const normalised = value.startsWith("#") ? value : value;
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
      <span className="uppercase tracking-[0.35em] text-cyan-200/80">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={safeHex(normalised)}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-9 w-9 cursor-pointer rounded-full border border-white/20 bg-transparent"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-32 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
          placeholder="#0EA5E9"
        />
      </div>
    </label>
  );
}

function PreviewPanel({ sampleText, analysis }: { sampleText: string; analysis: PairAnalysis }) {
  if (analysis.ratio === null) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 p-6 text-sm text-rose-200/80">
        {analysis.error ?? "Enter valid colours to preview."}
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[180px] flex-col gap-4 rounded-2xl border border-white/10 p-6 shadow-inner"
      style={{ backgroundColor: analysis.sampleBg, color: analysis.sampleFg }}
    >
      <p className="text-xs uppercase tracking-[0.35em] text-white/60">Preview</p>
      <p className="text-lg font-semibold drop-shadow-lg">{sampleText || DEFAULT_SAMPLE}</p>
      <small className="mt-auto text-xs text-white/70">
        Suggested text colour: <span className="font-semibold">{analysis.sampleFg}</span>
      </small>
    </div>
  );
}

function MetricsPanel({ analysis }: { analysis: PairAnalysis }) {
  if (analysis.ratio === null) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-rose-200/80">
        Provide two valid colours to calculate contrast.
      </div>
    );
  }

  const chips = [
    { label: "AA (4.5)", active: analysis.passesAA },
    { label: "AAA (7)", active: analysis.passesAAA },
    { label: "AA Large (3)", active: analysis.passesLarge },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Contrast ratio</p>
          <p className="text-3xl font-semibold text-white">{analysis.ratio.toFixed(2)}:1</p>
        </div>
        <span className={`rounded-full px-4 py-1 text-xs uppercase tracking-[0.35em] ${ratingChipClass(analysis.rating)}`}>
          {analysis.rating}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className={`rounded-full border px-3 py-1 text-xs ${
              chip.active ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200" : "border-white/10 bg-white/5 text-slate-400"
            }`}
          >
            {chip.label}
          </span>
        ))}
      </div>

      <div className="space-y-2 text-xs">
        <p className="uppercase tracking-[0.35em] text-cyan-200/70">Improvement ideas</p>
        {analysis.recommendations.map((rec, index) => (
          <div key={`${rec.color}-${index}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="space-y-1">
              <p className="font-semibold text-white">
                {rec.target === "foreground" ? "Adjust foreground" : "Adjust background"} ({rec.direction})
              </p>
              <p className="text-slate-300">
                Aim for {rec.goal} by moving towards <span className="font-mono text-white">{rec.color}</span>
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/70">
              {rec.ratio.toFixed(2)}:1
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuidelinesCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl shadow-purple-900/20">
      <h2 className="text-lg font-semibold text-white">WCAG quick guide</h2>
      <ul className="mt-4 space-y-2 text-xs text-slate-300">
        <li>• Body text should reach AA (4.5:1) or higher.</li>
        <li>• Large text (≥18pt regular or 14pt bold) may meet AA Large (3:1).</li>
        <li>• Logos and decorative text are exempt but aim for AA where possible.</li>
        <li>• Dark modes benefit from extra contrast for low-vision users.</li>
      </ul>
    </div>
  );
}

function TipsCard({ analyses }: { analyses: PairAnalysis[] }) {
  const failing = analyses.filter((analysis) => analysis.ratio !== null && !analysis.passesAA);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl shadow-blue-900/20">
      <h2 className="text-lg font-semibold text-white">Suite insights</h2>
      <div className="mt-4 space-y-3 text-xs text-slate-300">
        {failing.length === 0 ? (
          <p>All active pairs pass AA — great work! Keep pushing for AAA where readability matters most.</p>
        ) : (
          <p>{failing.length} pair{failing.length === 1 ? "" : "s"} currently fail AA. Try the suggested adjustments for quick wins.</p>
        )}
        <p>
          Pair ContrastSmith with PaletteSmith or GradientSmith to audit brand palettes as you explore new colour ideas.
        </p>
        <p>
          Export colour tokens via TokenSmith once you have compliant pairs to keep your design system in sync.
        </p>
      </div>
    </div>
  );
}

function ratingChipClass(rating: ContrastRating | null): string {
  if (!rating) return "border-white/10 bg-white/5 text-slate-400";
  switch (rating) {
    case "AAA":
      return "border-emerald-500/60 bg-emerald-500/20 text-emerald-200";
    case "AA":
      return "border-teal-400/60 bg-teal-500/20 text-teal-200";
    case "AA Large":
      return "border-sky-400/60 bg-sky-500/20 text-sky-200";
    default:
      return "border-rose-400/60 bg-rose-500/20 text-rose-200";
  }
}

function safeHex(value: string): string {
  const trimmed = value.trim();
  const parsed = parseColor(trimmed);
  if (parsed) {
    return toHex(parsed);
  }
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return "#000000";
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

