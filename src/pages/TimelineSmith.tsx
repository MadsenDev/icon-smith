import { useMemo, useState } from "react";
import { saveAs } from "file-saver";

type TimelineItem = {
  id: string;
  title: string;
  date: string;
  description: string;
  status: "planned" | "in-progress" | "done";
};

const defaultItems: TimelineItem[] = [
  { id: "item-1", title: "Kickoff", date: "2025-01-10", description: "Project kickoff and discovery", status: "done" },
  { id: "item-2", title: "MVP beta", date: "2025-03-01", description: "First beta shipping to internal users", status: "in-progress" },
  { id: "item-3", title: "Public launch", date: "2025-05-15", description: "General availability release", status: "planned" },
];

export default function TimelineSmithPage() {
  const [items, setItems] = useState<TimelineItem[]>(defaultItems);
  const [title, setTitle] = useState("Release roadmap");

  const jsonExport = useMemo(() => JSON.stringify({ title, items }, null, 2), [title, items]);
  const reactComponentExport = useMemo(() => buildReactComponent(title, items), [title, items]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${prev.length + 1}`,
        title: "New milestone",
        date: new Date().toISOString().slice(0, 10),
        description: "",
        status: "planned",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const downloadJson = () => {
    const blob = new Blob([jsonExport], { type: "application/json" });
    saveAs(blob, `${title.replace(/\s+/g, "-").toLowerCase()}-timeline.json`);
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">TimelineSmith</h1>
            <p className="text-sm text-slate-200/80">
              Plan product launches, roadmap milestones, or content calendars, then export JSON or ready-to-drop React components.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-200">
            <button
              type="button"
              onClick={addItem}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 uppercase tracking-[0.35em] transition hover:bg-white/20"
            >
              Add milestone
            </button>
            <button
              type="button"
              onClick={downloadJson}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 uppercase tracking-[0.35em] transition hover:bg-white/20"
            >
              Download JSON
            </button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
              Timeline title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
          </div>

          {items.length === 0 ? (
            <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-xl shadow-cyan-900/20">
              Add milestones to build out your timeline. Each item contains a date, summary, and optional description.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl shadow-teal-900/20">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">{item.title}</h2>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-rose-200 transition hover:bg-rose-500/20"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      Title
                      <input
                        value={item.title}
                        onChange={(event) => setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, title: event.target.value } : entry)))}
                        className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                    <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      Date
                      <input
                        type="date"
                        value={item.date}
                        onChange={(event) => setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, date: event.target.value } : entry)))}
                        className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                  </div>
                  <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                    Status
                    <select
                      value={item.status}
                      onChange={(event) => setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, status: event.target.value as TimelineItem["status"] } : entry)))}
                      className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                    >
                      <option value="planned">Planned</option>
                      <option value="in-progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                    Description
                    <textarea
                      value={item.description}
                      onChange={(event) => setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, description: event.target.value } : entry)))}
                      className="h-24 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-slate-100 outline-none"
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <ExportBlock title="JSON export" code={jsonExport} />
          <ExportBlock title="React component" code={reactComponentExport} />
        </aside>
      </div>
    </div>
  );
}

function ExportBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20">
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

function buildReactComponent(title: string, items: TimelineItem[]): string {
  const lines = [
    "export function Timeline() {",
    "  return (",
    "    <div className=\"space-y-6\">",
    `      <h2 className=\"text-lg font-semibold\">${title}</h2>`,
    "      <ol className=\"space-y-4 border-l border-white/10 pl-6\">",
  ];
  items.forEach((item) => {
    lines.push(
      "        <li className=\"relative\">",
      "          <span className=\"absolute -left-3 top-1 h-2 w-2 rounded-full bg-cyan-400\" />",
      `          <p className=\"text-xs uppercase tracking-[0.35em] text-cyan-200/70\">${item.date} • ${item.status}</p>`,
      `          <h3 className=\"text-sm font-semibold text-white\">${item.title}</h3>`,
      item.description ? `          <p className=\"text-xs text-slate-300\">${item.description}</p>` : "",
      "        </li>",
    );
  });
  lines.push("      </ol>", "    </div>", "  );", "}");
  return lines.filter(Boolean).join("\n");
}

