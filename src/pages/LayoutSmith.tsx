import { useMemo, useState, type CSSProperties } from "react";

type Mode = "grid" | "flex";

type PreviewSettings = {
  mode: Mode;
  columns: number;
  rows: number;
  gap: number;
  minRowHeight: number;
  flexDirection: "row" | "column";
  flexWrap: "nowrap" | "wrap";
  justify: "flex-start" | "center" | "space-between" | "space-around" | "space-evenly" | "flex-end";
  align: "stretch" | "flex-start" | "center" | "flex-end";
};

const defaultSettings: PreviewSettings = {
  mode: "grid",
  columns: 3,
  rows: 2,
  gap: 16,
  minRowHeight: 160,
  flexDirection: "row",
  flexWrap: "wrap",
  justify: "flex-start",
  align: "stretch",
};

const cellPalette = [
  "bg-gradient-to-br from-cyan-500/30 via-transparent to-purple-500/40",
  "bg-gradient-to-br from-sky-500/30 via-transparent to-blue-500/30",
  "bg-gradient-to-br from-purple-500/30 via-transparent to-rose-500/30",
  "bg-gradient-to-br from-teal-500/30 via-transparent to-emerald-500/30",
  "bg-gradient-to-br from-amber-500/30 via-transparent to-orange-500/30",
  "bg-gradient-to-br from-fuchsia-500/30 via-transparent to-indigo-500/30",
];

export default function LayoutSmithPage() {
  const [settings, setSettings] = useState<PreviewSettings>(defaultSettings);
  const [containerWidth, setContainerWidth] = useState(960);
  const [containerHeight, setContainerHeight] = useState(520);

  const boxCount = useMemo(() => (settings.mode === "grid" ? settings.columns * settings.rows : 6), [settings]);

  const gridCss = useMemo(() => {
    if (settings.mode !== "grid") return "";
    const templateColumns = `grid-template-columns: repeat(${settings.columns}, minmax(0, 1fr));`;
    const templateRows = `grid-auto-rows: minmax(${settings.minRowHeight}px, auto);`;
    const gap = `gap: ${settings.gap}px;`;
    return `display: grid;\n${templateColumns}\n${templateRows}\n${gap}`;
  }, [settings]);

  const flexCss = useMemo(() => {
    if (settings.mode !== "flex") return "";
    const dir = `flex-direction: ${settings.flexDirection};`;
    const wrap = `flex-wrap: ${settings.flexWrap};`;
    const justify = `justify-content: ${settings.justify};`;
    const align = `align-items: ${settings.align};`;
    const gap = `gap: ${settings.gap}px;`;
    return `display: flex;\n${dir}\n${wrap}\n${justify}\n${align}\n${gap}`;
  }, [settings]);

  const cssExport = settings.mode === "grid" ? gridCss : flexCss;

  const previewStyle: CSSProperties = settings.mode === "grid"
    ? {
        display: "grid",
        gridTemplateColumns: `repeat(${settings.columns}, minmax(0, 1fr))`,
        gridAutoRows: `minmax(${settings.minRowHeight}px, auto)`,
        gap: `${settings.gap}px`,
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      }
    : {
        display: "flex",
        flexDirection: settings.flexDirection,
        flexWrap: settings.flexWrap,
        justifyContent: settings.justify,
        alignItems: settings.align,
        gap: `${settings.gap}px`,
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      };

  const responsiveSnippet = useMemo(() => {
    const base = [`.layout {`, `  ${cssExport.split("\n").join("\n  ")}`, `}`];
    const mdColumns = Math.max(1, settings.columns - 1);
    const mobileColumns = Math.max(1, settings.columns - 2);

    if (settings.mode === "grid") {
      base.push(
        "",
        "@media (max-width: 1024px) {",
        `  .layout { grid-template-columns: repeat(${mdColumns}, minmax(0, 1fr)); }`,
        "}",
        "@media (max-width: 640px) {",
        `  .layout { grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr)); }`,
        "}",
      );
    } else {
      base.push(
        "",
        "@media (max-width: 1024px) {",
        `  .layout { flex-wrap: wrap; gap: ${Math.max(8, settings.gap - 4)}px; }`,
        "}",
        "@media (max-width: 640px) {",
        "  .layout { flex-direction: column; align-items: stretch; }",
        "}",
      );
    }

    return base.join("\n");
  }, [cssExport, settings]);

  return (
    <div className="space-y-10 text-slate-200">
      <section className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Layout blueprint</p>
            <h2 className="text-xl font-semibold text-white">Prototype responsive wrappers</h2>
          </header>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, mode: "grid" }))}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.35em] transition ${
                settings.mode === "grid"
                  ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100"
                  : "border-white/10 bg-white/10 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-100"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, mode: "flex" }))}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.35em] transition ${
                settings.mode === "flex"
                  ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100"
                  : "border-white/10 bg-white/10 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-100"
              }`}
            >
              Flex
            </button>
          </div>

          {settings.mode === "grid" ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Columns</span>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={settings.columns}
                    onChange={(event) =>
                      setSettings((prev) => ({ ...prev, columns: Math.max(1, Math.min(6, Number.parseInt(event.target.value, 10) || prev.columns)) }))
                    }
                    className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Rows</span>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={settings.rows}
                    onChange={(event) =>
                      setSettings((prev) => ({ ...prev, rows: Math.max(1, Math.min(6, Number.parseInt(event.target.value, 10) || prev.rows)) }))
                    }
                    className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                  />
                </label>
              </div>
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Minimum row height (px)</span>
                <input
                  type="number"
                  min={80}
                  max={320}
                  value={settings.minRowHeight}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      minRowHeight: Math.max(80, Math.min(320, Number.parseInt(event.target.value, 10) || prev.minRowHeight)),
                    }))
                  }
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Direction</span>
                  <select
                    value={settings.flexDirection}
                    onChange={(event) => setSettings((prev) => ({ ...prev, flexDirection: event.target.value as PreviewSettings["flexDirection"] }))}
                    className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                  >
                    <option value="row">Row</option>
                    <option value="column">Column</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Wrap</span>
                  <select
                    value={settings.flexWrap}
                    onChange={(event) => setSettings((prev) => ({ ...prev, flexWrap: event.target.value as PreviewSettings["flexWrap"] }))}
                    className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                  >
                    <option value="nowrap">No wrap</option>
                    <option value="wrap">Wrap</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Justify</span>
                  <select
                    value={settings.justify}
                    onChange={(event) => setSettings((prev) => ({ ...prev, justify: event.target.value as PreviewSettings["justify"] }))}
                    className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                  >
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                    <option value="space-between">Space between</option>
                    <option value="space-around">Space around</option>
                    <option value="space-evenly">Space evenly</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Align items</span>
                  <select
                    value={settings.align}
                    onChange={(event) => setSettings((prev) => ({ ...prev, align: event.target.value as PreviewSettings["align"] }))}
                    className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                  >
                    <option value="stretch">Stretch</option>
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Gap (px)</span>
            <input
              type="number"
              min={0}
              max={64}
              value={settings.gap}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, gap: Math.max(0, Math.min(64, Number.parseInt(event.target.value, 10) || prev.gap)) }))
              }
              className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Container width (px)</span>
              <input
                type="number"
                min={480}
                max={1440}
                value={containerWidth}
                onChange={(event) => setContainerWidth(Math.max(480, Math.min(1440, Number.parseInt(event.target.value, 10) || containerWidth)))}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Container height (px)</span>
              <input
                type="number"
                min={240}
                max={720}
                value={containerHeight}
                onChange={(event) => setContainerHeight(Math.max(240, Math.min(720, Number.parseInt(event.target.value, 10) || containerHeight)))}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              />
            </label>
          </div>
        </div>
        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
            <header className="mb-4 space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Live preview</p>
              <h2 className="text-xl font-semibold text-white">Generated layout</h2>
              <p className="text-xs text-slate-300">Drag the config into your components or iterate directly in CSS.</p>
            </header>
            <div className="flex items-center justify-center">
              <div className="relative rounded-2xl border border-white/10 bg-slate-950/60 p-6">
                <div className="mx-auto rounded-2xl border border-white/5 bg-slate-900/80 p-6">
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 p-4" style={previewStyle}>
                    {Array.from({ length: boxCount }).map((_, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-center rounded-2xl border border-white/10 text-xs uppercase tracking-[0.4em] text-slate-100 ${cellPalette[index % cellPalette.length]}`}
                      >
                        {settings.mode === "grid" ? `Cell ${index + 1}` : `Item ${index + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.35em] text-slate-500">{settings.mode} layout preview</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
            <header className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Responsive CSS</p>
              <h2 className="text-xl font-semibold text-white">Copy & adapt</h2>
            </header>
            <pre className="mt-4 max-h-72 overflow-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-200">
              <code>{responsiveSnippet}</code>
            </pre>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(responsiveSnippet).catch(() => {})}
              className="mt-4 inline-flex items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100 transition hover:bg-cyan-500/30"
            >
              Copy CSS
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
