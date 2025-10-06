import { useMemo, useState } from "react";
import { saveAs } from "file-saver";

type NodeShape = "rectangle" | "rounded" | "circle" | "diamond";

type FlowNode = {
  id: string;
  label: string;
  type: NodeShape;
};

type FlowEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
};

const defaultNodes: FlowNode[] = [
  { id: "node-1", label: "Start", type: "circle" },
  { id: "node-2", label: "Decision", type: "diamond" },
  { id: "node-3", label: "Success", type: "rounded" },
];

const defaultEdges: FlowEdge[] = [
  { id: "edge-1", from: "node-1", to: "node-2", label: "" },
  { id: "edge-2", from: "node-2", to: "node-3", label: "Yes" },
];

export default function FlowSmithPage() {
  const [nodes, setNodes] = useState<FlowNode[]>(defaultNodes);
  const [edges, setEdges] = useState<FlowEdge[]>(defaultEdges);

  const mermaidDefinition = useMemo(() => buildMermaid(nodes, edges), [nodes, edges]);
  const jsonExport = useMemo(() => JSON.stringify({ nodes, edges }, null, 2), [nodes, edges]);

  const addNode = () => {
    const nextNumber = nodes.length + 1;
    setNodes((prev) => [...prev, { id: `node-${nextNumber}`, label: `Node ${nextNumber}`, type: "rectangle" }]);
  };

  const addEdge = () => {
    if (nodes.length < 2) return;
    const [from, to] = nodes.slice(-2);
    setEdges((prev) => [...prev, { id: `edge-${prev.length + 1}`, from: from.id, to: to.id, label: "" }]);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setEdges((prev) => prev.filter((edge) => edge.from !== id && edge.to !== id));
  };

  const removeEdge = (id: string) => {
    setEdges((prev) => prev.filter((edge) => edge.id !== id));
  };

  const downloadMermaid = () => {
    const blob = new Blob([mermaidDefinition], { type: "text/plain" });
    saveAs(blob, "flow-graph.mmd");
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">FlowSmith</h1>
            <p className="text-sm text-slate-200/80">
              Quickly compose flowcharts, decisions, and success/failure paths. Export to Mermaid syntax or JSON for further tooling.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addNode}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
            >
              Add node
            </button>
            <button
              type="button"
              onClick={addEdge}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
            >
              Add edge
            </button>
            <button
              type="button"
              onClick={downloadMermaid}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
            >
              Download mermaid
            </button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="space-y-4">
          {nodes.length === 0 ? (
            <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-xl shadow-purple-900/20">
              Add nodes to start sketching your flow. Each node can connect to others via labelled edges.
            </p>
          ) : (
            <div className="space-y-3">
              {nodes.map((node) => (
                <div key={node.id} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl shadow-blue-900/20">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">{node.label}</h2>
                    <button
                      type="button"
                      onClick={() => removeNode(node.id)}
                      className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-rose-200 transition hover:bg-rose-500/20"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      Label
                      <input
                        value={node.label}
                        onChange={(event) => setNodes((prev) => prev.map((item) => (item.id === node.id ? { ...item, label: event.target.value } : item)))}
                        className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                    <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      Shape
                      <select
                        value={node.type}
                        onChange={(event) => setNodes((prev) => prev.map((item) => (item.id === node.id ? { ...item, type: event.target.value as NodeShape } : item)))}
                        className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="rectangle">Rectangle</option>
                        <option value="rounded">Rounded</option>
                        <option value="circle">Circle</option>
                        <option value="diamond">Decision</option>
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-teal-900/20">
            <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Edges ({edges.length})</h2>
            <div className="space-y-2">
              {edges.map((edge) => (
                <div key={edge.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
                  <div className="flex items-center justify-between">
                    <span>{edge.from} → {edge.to}</span>
                    <button
                      type="button"
                      onClick={() => removeEdge(edge.id)}
                      className="rounded-full border border-white/10 bg-rose-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.35em] text-rose-200 transition hover:bg-rose-500/20"
                    >
                      Remove
                    </button>
                  </div>
                  <label className="mt-2 block text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">
                    Label
                    <input
                      value={edge.label}
                      onChange={(event) => setEdges((prev) => prev.map((item) => (item.id === edge.id ? { ...item, label: event.target.value } : item)))}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/40 px-2 py-1 text-xs text-white outline-none"
                      placeholder="Optional"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
          <ExportBlock title="Mermaid definition" code={mermaidDefinition} />
          <ExportBlock title="JSON export" code={jsonExport} />
        </aside>
      </div>
    </div>
  );
}

function ExportBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-200 shadow-xl shadow-purple-900/20">
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

function buildMermaid(nodes: FlowNode[], edges: FlowEdge[]): string {
  const lines = ["flowchart TD"];
  nodes.forEach((node) => {
    const shape = toMermaidShape(node.type, node.label);
    lines.push(`  ${node.id}${shape}`);
  });
  edges.forEach((edge) => {
    const label = edge.label ? `|${edge.label}|` : "";
    lines.push(`  ${edge.from} -->${label} ${edge.to}`);
  });
  return lines.join("\n");
}

function toMermaidShape(type: NodeShape, label: string): string {
  switch (type) {
    case "circle":
      return `(("${label}"))`;
    case "diamond":
      return `{${label}}`;
    case "rounded":
      return `("${label}")`;
    case "rectangle":
    default:
      return `["${label}"]`;
  }
}

