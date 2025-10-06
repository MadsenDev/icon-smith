import { useMemo, useState } from "react";

const makeId = () => Math.random().toString(36).slice(2, 9);

type Keyframe = {
  id: string;
  offset: number;
  transform: string;
  opacity: number | "";
  easing: string;
};

const easingOptions = [
  { label: "Ease", value: "ease" },
  { label: "Ease-in", value: "ease-in" },
  { label: "Ease-out", value: "ease-out" },
  { label: "Ease-in-out", value: "ease-in-out" },
  { label: "Linear", value: "linear" },
  { label: "Springy", value: "cubic-bezier(0.25, 1.5, 0.5, 1)" },
  { label: "Custom", value: "cubic-bezier(0.68, -0.55, 0.27, 1.55)" },
];

const previewEasingOptions = [
  { label: "Ease", value: "ease" },
  { label: "Linear", value: "linear" },
  { label: "Ease in", value: "ease-in" },
  { label: "Ease out", value: "ease-out" },
  { label: "Ease in/out", value: "ease-in-out" },
  { label: "Bounce", value: "cubic-bezier(0.68, -0.6, 0.32, 1.6)" },
];

const defaultKeyframes: Keyframe[] = [
  { id: makeId(), offset: 0, transform: "translateY(0) scale(1)", opacity: 1, easing: "ease" },
  { id: makeId(), offset: 50, transform: "translateY(-25%) scale(1.05)", opacity: 1, easing: "ease" },
  { id: makeId(), offset: 100, transform: "translateY(0) scale(1)", opacity: 1, easing: "ease" },
];

const iterationOptions = [
  { value: "1", label: "Once" },
  { value: "2", label: "Twice" },
  { value: "3", label: "Thrice" },
  { value: "infinite", label: "Infinite" },
];

const directionOptions = [
  { value: "normal", label: "Normal" },
  { value: "reverse", label: "Reverse" },
  { value: "alternate", label: "Alternate" },
  { value: "alternate-reverse", label: "Alternate reverse" },
];

export default function AnimationSmithPage() {
  const [animationName, setAnimationName] = useState("smithWave");
  const [duration, setDuration] = useState(1.5);
  const [iterationCount, setIterationCount] = useState<string>("infinite");
  const [timingFunction, setTimingFunction] = useState("ease");
  const [direction, setDirection] = useState("alternate");
  const [keyframes, setKeyframes] = useState<Keyframe[]>(defaultKeyframes);

  const sortedKeyframes = useMemo(
    () => [...keyframes].sort((a, b) => a.offset - b.offset),
    [keyframes],
  );

  const keyframeCss = useMemo(() => {
    const lines = sortedKeyframes
      .map((frame) => {
        const opacity = frame.opacity === "" ? "" : `opacity: ${frame.opacity};`;
        const easing = frame.easing && frame.easing !== "inherit" ? `animation-timing-function: ${frame.easing};` : "";
        return `  ${frame.offset}% { ${frame.transform ? `transform: ${frame.transform};` : ""} ${opacity} ${easing} }`;
      })
      .join("\n");

    return `@keyframes ${animationName} {\n${lines}\n}`;
  }, [animationName, sortedKeyframes]);

  const jsonExport = useMemo(
    () =>
      JSON.stringify(
        sortedKeyframes.map(({ offset, transform, opacity, easing }) => ({
          offset: offset / 100,
          transform,
          opacity: opacity === "" ? undefined : opacity,
          easing,
        })),
        null,
        2,
      ),
    [sortedKeyframes],
  );

  const animationStyle = useMemo(() => {
    const durationValue = Number.isFinite(duration) && duration > 0 ? duration : 1.5;
    const timing = timingFunction || "linear";
    const iteration = iterationCount || "1";
    return {
      animation: `${animationName} ${durationValue}s ${timing} ${iteration} ${direction}`,
    } as const;
  }, [animationName, direction, duration, iterationCount, timingFunction]);

  const updateKeyframe = (id: string, updates: Partial<Keyframe>) => {
    setKeyframes((frames) => frames.map((frame) => (frame.id === id ? { ...frame, ...updates } : frame)));
  };

  const removeKeyframe = (id: string) => {
    setKeyframes((frames) => frames.filter((frame) => frame.id !== id));
  };

  const addKeyframe = () => {
    const lastOffset = sortedKeyframes[sortedKeyframes.length - 1]?.offset ?? 0;
    const nextOffset = Math.min(100, lastOffset + 10);
    setKeyframes((frames) => [
      ...frames,
      {
        id: makeId(),
        offset: nextOffset,
        transform: "translateY(0)",
        opacity: 1,
        easing: "ease",
      },
    ]);
  };

  return (
    <div className="space-y-10 text-slate-200">
      <style>{keyframeCss}</style>
      <section className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Animation controls</p>
            <h2 className="text-xl font-semibold text-white">Timeline configuration</h2>
          </header>
          <div className="space-y-4 text-sm">
            <label className="grid gap-1">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Animation name</span>
              <input
                value={animationName}
                onChange={(event) => setAnimationName(event.target.value || "smithWave")}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Duration (seconds)</span>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={duration}
                  onChange={(event) => setDuration(Number.parseFloat(event.target.value) || 1.5)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Iteration count</span>
                <select
                  value={iterationCount}
                  onChange={(event) => setIterationCount(event.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                >
                  {iterationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Timing function</span>
                <select
                  value={timingFunction}
                  onChange={(event) => setTimingFunction(event.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                >
                  {previewEasingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Direction</span>
                <select
                  value={direction}
                  onChange={(event) => setDirection(event.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                >
                  {directionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-600/10 p-8 shadow-xl shadow-cyan-900/20">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <header className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Live preview</p>
              <h2 className="text-xl font-semibold text-white">Animate the block</h2>
            </header>
            <div className="flex flex-1 items-center justify-center">
              <div
                className="h-32 w-32 rounded-3xl bg-gradient-to-br from-cyan-400 via-sky-500 to-purple-500 shadow-2xl shadow-cyan-900/40"
                style={animationStyle}
              />
            </div>
            <p className="text-xs text-slate-300">
              Animation applies the generated keyframes in real time. Export snippets below to embed in your project.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Keyframes</p>
              <h2 className="text-xl font-semibold text-white">Define motion steps</h2>
            </div>
            <button
              type="button"
              onClick={addKeyframe}
              className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-cyan-100 transition hover:bg-cyan-500/30"
            >
              Add step
            </button>
          </header>
          <div className="space-y-4">
            {sortedKeyframes.map((frame, index) => (
              <div key={frame.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                      <label className="grid gap-1 text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                        Offset
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={frame.offset}
                          onChange={(event) =>
                            updateKeyframe(frame.id, {
                              offset: Math.max(0, Math.min(100, Number.parseFloat(event.target.value) || 0)),
                            })
                          }
                          className="rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                        />
                      </label>
                      <label className="grid gap-1 text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                        Transform
                        <input
                          value={frame.transform}
                          onChange={(event) => updateKeyframe(frame.id, { transform: event.target.value })}
                          placeholder="e.g. translateX(20px) rotate(5deg)"
                          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                      <label className="grid gap-1 text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                        Opacity
                        <input
                          type="number"
                          min={0}
                          max={1}
                          step={0.05}
                          value={frame.opacity}
                          onChange={(event) => {
                            const value = event.target.value;
                            updateKeyframe(frame.id, {
                              opacity: value === "" ? "" : Math.max(0, Math.min(1, Number.parseFloat(value) || 0)),
                            });
                          }}
                          className="rounded-xl border border-white/10 bg-slate-950 px-2 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                        />
                      </label>
                      <label className="grid gap-1 text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                        Step easing
                        <select
                          value={frame.easing}
                          onChange={(event) => updateKeyframe(frame.id, { easing: event.target.value })}
                          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                        >
                          {easingOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                  {sortedKeyframes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKeyframe(frame.id)}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.4em] text-slate-300 transition hover:border-rose-400/40 hover:text-rose-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[11px] uppercase tracking-[0.4em] text-slate-500">Frame {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <div className="space-y-3">
            <header>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">CSS export</p>
              <h2 className="text-xl font-semibold text-white">Drop straight into your stylesheet</h2>
            </header>
            <pre className="max-h-64 overflow-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-200">
              <code>{keyframeCss}</code>
            </pre>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(keyframeCss).catch(() => {})}
              className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-cyan-100 transition hover:bg-cyan-500/30"
            >
              Copy CSS
            </button>
          </div>
          <div className="space-y-3">
            <header>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">JSON export</p>
              <h2 className="text-xl font-semibold text-white">Share timelines with tooling</h2>
            </header>
            <pre className="max-h-64 overflow-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-200">
              <code>{jsonExport}</code>
            </pre>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(jsonExport).catch(() => {})}
              className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-cyan-100 transition hover:bg-cyan-500/30"
            >
              Copy JSON
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
