import { useMemo, useState } from "react";
import { ComingSoon } from "../components/ComingSoon";

type StateNode = {
  id: string;
  name: string;
  initial: boolean;
  on: string;
  target: string;
};

const defaultNodes: StateNode[] = [
  { id: "node-1", name: "idle", initial: true, on: "SUBMIT", target: "loading" },
  { id: "node-2", name: "loading", initial: false, on: "SUCCESS", target: "success" },
  { id: "node-3", name: "success", initial: false, on: "RESET", target: "idle" },
];

export default function StateSmithPage() {
  const [nodes, setNodes] = useState<StateNode[]>(defaultNodes);
  const [machineName, setMachineName] = useState("formMachine");

  const xstateExport = useMemo(() => buildXStateConfig(machineName, nodes), [machineName, nodes]);
  const jsonExport = useMemo(() => JSON.stringify(buildJsonConfig(machineName, nodes), null, 2), [machineName, nodes]);

  const addNode = () => {
    const num = nodes.length + 1;
    setNodes((prev) => [...prev, { id: `node-${num}`, name: `state${num}`, initial: false, on: "", target: "" }]);
  };

  const updateNode = (id: string, update: Partial<StateNode>) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, ...update } : node)));
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">StateSmith</h1>
            <p className="text-sm text-slate-200/80">
              Map finite state machines, define transitions, and export XState or JSON definitions for your apps.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-slate-200">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
              Machine name
              <input
                value={machineName}
                onChange={(event) => setMachineName(event.target.value)}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <button
              type="button"
              onClick={addNode}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
            >
              Add state
            </button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-4">
          {nodes.length === 0 ? (
            <ComingSoon title="Add your first state" description="Define nodes, transitions, and exports to power XState or JSON-based state machines." />
          ) : (
            nodes.map((node) => (
              <div key={node.id} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl shadow-teal-900/20">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">{node.name}</h2>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">
                      <input
                        type="checkbox"
                        checked={node.initial}
                        onChange={(event) => updateNode(node.id, { initial: event.target.checked })}
                        className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
                      />
                      Initial
                    </label>
                    <button
                      type="button"
                      onClick={() => removeNode(node.id)}
                      className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-rose-200 transition hover:bg-rose-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                    State name
                    <input
                      value={node.name}
                      onChange={(event) => updateNode(node.id, { name: event.target.value })}
                      className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                    On event
                    <input
                      value={node.on}
                      onChange={(event) => updateNode(node.id, { on: event.target.value })}
                      className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                      placeholder="SUBMIT"
                    />
                  </label>
                </div>
                <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                  Target state
                  <input
                    value={node.target}
                    onChange={(event) => updateNode(node.id, { target: event.target.value })}
                    className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                    placeholder="loading"
                  />
                </label>
              </div>
            ))
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <ExportCard title="XState config" code={xstateExport} />
          <ExportCard title="JSON definition" code={jsonExport} />
        </aside>
      </div>
    </div>
  );
}

function ExportCard({ title, code }: { title: string; code: string }) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Export</p>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(code).catch(() => {})}
          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
        >
          Copy
        </button>
      </header>
      <pre className="max-h-64 overflow-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function buildXStateConfig(machineName: string, nodes: StateNode[]): string {
  const initialState = nodes.find((node) => node.initial)?.name ?? nodes[0]?.name ?? "start";
  const stateEntries = nodes
    .map((node) => {
      const transitions = node.on && node.target
        ? `on: { ${node.on}: '${node.target}' }`
        : "on: {}";
      return `    ${node.name}: { ${transitions} }`;
    })
    .join(",\n");
  return `import { createMachine } from "xstate";\n\n` +
    `export const ${machineName} = createMachine({\n` +
    `  id: '${machineName}',\n` +
    `  initial: '${initialState}',\n` +
    `  states: {\n${stateEntries}\n  }\n});`;
}

function buildJsonConfig(machineName: string, nodes: StateNode[]) {
  const initialState = nodes.find((node) => node.initial)?.name ?? nodes[0]?.name ?? "start";
  const states = nodes.reduce<Record<string, { on: Record<string, string> }>>((acc, node) => {
    acc[node.name] = { on: node.on && node.target ? { [node.on]: node.target } : {} };
    return acc;
  }, {});
  return {
    id: machineName,
    initial: initialState,
    states,
  };
}

