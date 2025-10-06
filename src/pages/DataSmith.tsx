import { useMemo, useState } from "react";
import { useSeed } from "../hooks/useSeed";
import {
  dataFieldPresets,
  datasetToCsv,
  datasetToJson,
  type DataFieldDefinition,
  type DataFieldType,
  generateDataset,
} from "../utils/data";

const defaultFields: DataFieldDefinition[] = [
  dataFieldPresets.find((field) => field.id === "id")!,
  dataFieldPresets.find((field) => field.id === "fullName")!,
  dataFieldPresets.find((field) => field.id === "email")!,
  dataFieldPresets.find((field) => field.id === "company")!,
  dataFieldPresets.find((field) => field.id === "jobTitle")!,
  dataFieldPresets.find((field) => field.id === "country")!,
];

const typeOptions: Array<{ value: DataFieldType; label: string }> = dataFieldPresets.map((field) => ({
  value: field.type,
  label: field.label,
}));

export default function DataSmithPage() {
  const [fields, setFields] = useState<DataFieldDefinition[]>(defaultFields);
  const [recordCount, setRecordCount] = useState<number>(20);
  const [integerMin, setIntegerMin] = useState<number>(0);
  const [integerMax, setIntegerMax] = useState<number>(100);
  const [format, setFormat] = useState<"json" | "csv">("json");

  const { seed, setSeed, reseed } = useSeed();

  const { dataset, exported } = useMemo(() => {
    const options = {
      seed,
      integerRange: { min: integerMin, max: integerMax },
    } as const;

    const generated = generateDataset(fields, recordCount, options);

    return {
      dataset: generated,
      exported: format === "json" ? datasetToJson(generated) : datasetToCsv(fields, generated),
    };
  }, [fields, recordCount, format, seed, integerMin, integerMax]);

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">DataSmith</h1>
            <p className="text-sm text-slate-200/80">
              Generate synthetic datasets for prototyping, testing, or demos with repeatable seeds.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-200">
            <SeedControls seed={seed} onChange={setSeed} onReseed={reseed} />
            <FormatToggle format={format} onChange={setFormat} />
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="space-y-6">
          <FieldConfigurator
            fields={fields}
            onChange={setFields}
          />
          <RecordControls
            recordCount={recordCount}
            onRecordCountChange={setRecordCount}
            integerMin={integerMin}
            integerMax={integerMax}
            onIntegerMinChange={setIntegerMin}
            onIntegerMaxChange={setIntegerMax}
          />
          <PreviewPanel exported={exported} format={format} />
        </section>

        <aside className="space-y-6">
          <DatasetSummary
            records={dataset.records.length}
            fields={fields.length}
            format={format}
          />
          <SchemaPanel />
          <TipsPanel />
        </aside>
      </div>
    </div>
  );
}

function FieldConfigurator({ fields, onChange }: { fields: DataFieldDefinition[]; onChange: (fields: DataFieldDefinition[]) => void }) {
  const availableFields = dataFieldPresets.filter((preset) => !fields.some((field) => field.id === preset.id));

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Fields</h2>
        <button
          type="button"
          onClick={() => {
            if (availableFields.length === 0) return;
            onChange([...fields, availableFields[0]]);
          }}
          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
          disabled={availableFields.length === 0}
        >
          Add field
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <FieldRow
            key={field.id}
            field={field}
            onUpdate={(updated) => {
              const next = [...fields];
              next[index] = updated;
              onChange(next);
            }}
            onRemove={() => {
              onChange(fields.filter((item) => item.id !== field.id));
            }}
          />
        ))}
        {fields.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-300">
            Add fields to define your dataset schema.
          </p>
        )}
      </div>
    </div>
  );
}

function FieldRow({
  field,
  onUpdate,
  onRemove,
}: {
  field: DataFieldDefinition;
  onUpdate: (field: DataFieldDefinition) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
          Field label
          <input
            value={field.label}
            onChange={(event) => onUpdate({ ...field, label: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
          Field key
          <input
            value={field.id}
            onChange={(event) => onUpdate({ ...field, id: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
          />
        </label>
      </div>
      <div className="flex flex-col gap-3 md:w-64">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
          Type
          <select
            value={field.type}
            onChange={(event) => onUpdate({ ...field, type: event.target.value as DataFieldType })}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-rose-200 transition hover:bg-rose-500/20"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function RecordControls({
  recordCount,
  onRecordCountChange,
  integerMin,
  integerMax,
  onIntegerMinChange,
  onIntegerMaxChange,
}: {
  recordCount: number;
  onRecordCountChange: (value: number) => void;
  integerMin: number;
  integerMax: number;
  onIntegerMinChange: (value: number) => void;
  onIntegerMaxChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-teal-900/20 md:grid-cols-3">
      <RecordControl
        label="Rows"
        value={recordCount}
        min={1}
        max={1000}
        onChange={onRecordCountChange}
        help="Number of records to generate"
      />
      <RecordControl
        label="Min integer"
        value={integerMin}
        min={-1000}
        max={integerMax}
        onChange={onIntegerMinChange}
        help="Lower bound for integer fields"
      />
      <RecordControl
        label="Max integer"
        value={integerMax}
        min={integerMin}
        max={5000}
        onChange={onIntegerMaxChange}
        help="Upper bound for integer fields"
      />
    </div>
  );
}

function RecordControl({
  label,
  value,
  onChange,
  min,
  max,
  help,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  help: string;
}) {
  return (
    <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
      <span className="uppercase tracking-[0.35em] text-cyan-200/80">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        min={min}
        max={max}
        className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
      />
      <span className="text-xs text-slate-400">{help}</span>
    </label>
  );
}

function PreviewPanel({ exported, format }: { exported: string; format: "json" | "csv" }) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Preview</h2>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200">{format.toUpperCase()}</span>
      </div>
      <textarea
        value={exported}
        readOnly
        className="h-64 w-full rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-slate-100 shadow-inner"
      />
      <div className="flex flex-wrap gap-2 text-xs text-slate-300">
        <CopyButton label="Copy"
          value={exported}
        />
      </div>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className={`rounded-full border px-3 py-1 uppercase tracking-[0.35em] transition ${copied ? "border-emerald-400/60 bg-emerald-500/20 text-white" : "border-white/10 bg-white/10 text-slate-200 hover:bg-white/20"}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function DatasetSummary({ records, fields, format }: { records: number; fields: number; format: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-xl shadow-cyan-900/20">
      <h2 className="text-sm font-semibold text-white">Dataset summary</h2>
      <ul className="mt-3 space-y-1">
        <li><strong className="text-white">{records.toLocaleString()}</strong> rows</li>
        <li><strong className="text-white">{fields}</strong> fields</li>
        <li>Export: <span className="text-white uppercase">{format}</span></li>
      </ul>
    </div>
  );
}

function SchemaPanel() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-xl shadow-blue-900/20">
      <h2 className="text-sm font-semibold text-white">Field presets</h2>
      <ul className="mt-3 space-y-2">
        {dataFieldPresets.map((field) => (
          <li key={field.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="text-sm text-white">{field.label}</p>
            <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">{field.type}</p>
            <p className="text-[11px] text-slate-400">{field.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TipsPanel() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300 shadow-xl shadow-purple-900/20">
      <h2 className="text-sm font-semibold text-white">Tips</h2>
      <ul className="mt-3 space-y-2">
        <li>• Use stable seeds to regenerate identical datasets on every build.</li>
        <li>• Keep field keys lowercase with underscores for easy JSON parsing.</li>
        <li>• Switch to CSV format to paste directly into spreadsheets.</li>
        <li>• Adjust integer range to simulate scoring or inventory values.</li>
      </ul>
    </div>
  );
}

function SeedControls({ seed, onChange, onReseed }: { seed: string; onChange: (seed: string) => void; onReseed: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">Seed</p>
      <input
        value={seed}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white outline-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReseed}
          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
        >
          Shuffle
        </button>
      </div>
    </div>
  );
}

function FormatToggle({ format, onChange }: { format: "json" | "csv"; onChange: (format: "json" | "csv") => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/70">Format</p>
      <div className="flex gap-2">
        {(["json", "csv"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] transition ${
              format === option ? "bg-white/20 text-white" : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

