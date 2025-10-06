import { useMemo, useState } from "react";
import {
  createColumnTemplate,
  createSchemaSql,
  createTableTemplate,
  type MysqlColumnDefinition,
  type MysqlDefaultType,
  type MysqlTableDefinition,
  mysqlCharsetOptions,
  mysqlDataTypeOptions,
  mysqlEngineOptions,
  primaryKeySupported,
} from "../utils/mysql";

const defaultTables: MysqlTableDefinition[] = [
  createTableTemplate("users", [
    {
      name: "id",
      type: "INT",
      length: "11",
      unsigned: true,
      nullable: false,
      autoIncrement: true,
      primaryKey: true,
      defaultType: "none",
      defaultValue: "",
    },
    {
      name: "email",
      type: "VARCHAR",
      length: "190",
      unsigned: false,
      nullable: false,
      autoIncrement: false,
      primaryKey: false,
      defaultType: "none",
      defaultValue: "",
    },
    {
      name: "created_at",
      type: "TIMESTAMP",
      unsigned: false,
      nullable: false,
      autoIncrement: false,
      primaryKey: false,
      defaultType: "expression",
      defaultValue: "CURRENT_TIMESTAMP",
    },
  ]),
];

export default function SchemaSmithPage() {
  const [databaseName, setDatabaseName] = useState("app_db");
  const [tables, setTables] = useState<MysqlTableDefinition[]>(defaultTables);

  const schema = useMemo(() => createSchemaSql(databaseName, tables), [databaseName, tables]);

  const totalColumns = useMemo(
    () => tables.reduce((sum, table) => sum + table.columns.length, 0),
    [tables],
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">SchemaSmith</h1>
            <p className="text-sm text-slate-200/80">
              Define MySQL databases visually — configure tables, columns, and constraints, then export production-ready CREATE
              statements.
            </p>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6">
          <DatabaseSettings value={databaseName} onChange={setDatabaseName} />
          <TableEditor tables={tables} onChange={setTables} />
        </section>

        <aside className="space-y-6">
          <SummaryPanel tableCount={tables.length} columnCount={totalColumns} />
          <SqlPreviewPanel value={schema} />
          <TipsPanel />
        </aside>
      </div>
    </div>
  );
}

function DatabaseSettings({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Database</h2>
      </div>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
        Name
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
          placeholder="app_db"
        />
      </label>
    </div>
  );
}

function TableEditor({
  tables,
  onChange,
}: {
  tables: MysqlTableDefinition[];
  onChange: (tables: MysqlTableDefinition[]) => void;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-blue-900/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Tables</h2>
        <button
          type="button"
          onClick={() => onChange([...tables, createTableTemplate(`table_${tables.length + 1}`)])}
          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
        >
          Add table
        </button>
      </div>

      <div className="space-y-4">
        {tables.map((table, index) => (
          <TableCard
            key={table.id}
            table={table}
            onUpdate={(updated) => {
              const next = [...tables];
              next[index] = updated;
              onChange(next);
            }}
            onRemove={() => onChange(tables.filter((item) => item.id !== table.id))}
          />
        ))}
        {tables.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-300">
            Add tables to start drafting your schema.
          </p>
        )}
      </div>
    </div>
  );
}

function TableCard({
  table,
  onUpdate,
  onRemove,
}: {
  table: MysqlTableDefinition;
  onUpdate: (table: MysqlTableDefinition) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
              Table name
              <input
                value={table.name}
                onChange={(event) => onUpdate({ ...table, name: event.target.value })}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
              Engine
              <select
                value={table.engine}
                onChange={(event) => onUpdate({ ...table, engine: event.target.value })}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
              >
                {mysqlEngineOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
              Charset
              <select
                value={table.charset}
                onChange={(event) => onUpdate({ ...table, charset: event.target.value })}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
              >
                {mysqlCharsetOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
            Comment
            <input
              value={table.comment}
              onChange={(event) => onUpdate({ ...table, comment: event.target.value })}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
              placeholder="Optional description"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="h-9 w-fit rounded-full border border-white/10 bg-rose-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-rose-200 transition hover:bg-rose-500/20"
        >
          Remove table
        </button>
      </div>

      <ColumnEditor
        columns={table.columns}
        onChange={(columns) => onUpdate({ ...table, columns })}
      />
    </div>
  );
}

function ColumnEditor({
  columns,
  onChange,
}: {
  columns: MysqlColumnDefinition[];
  onChange: (columns: MysqlColumnDefinition[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Columns</h3>
        <button
          type="button"
          onClick={() => onChange([...columns, createColumnTemplate({ length: "255" })])}
          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
        >
          Add column
        </button>
      </div>
      {columns.map((column, index) => (
        <ColumnRow
          key={column.id}
          column={column}
          onUpdate={(updated) => {
            const next = [...columns];
            next[index] = updated;
            onChange(next);
          }}
          onRemove={() => onChange(columns.filter((item) => item.id !== column.id))}
        />
      ))}
      {columns.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-slate-300">Add columns for this table.</p>
      )}
    </div>
  );
}

function ColumnRow({
  column,
  onUpdate,
  onRemove,
}: {
  column: MysqlColumnDefinition;
  onUpdate: (column: MysqlColumnDefinition) => void;
  onRemove: () => void;
}) {
  const dataType = mysqlDataTypeOptions.find((option) => option.value === column.type);
  const showLength = dataType?.supportsLength ?? false;
  const showUnsigned = dataType?.numeric ?? false;
  const allowAutoIncrement = dataType?.autoIncrementOnly ?? false;
  const allowPrimaryKey = primaryKeySupported(column.type);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/50 p-4 md:flex-row md:items-start md:justify-between">
      <div className="grid flex-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
          Column name
          <input
            value={column.name}
            onChange={(event) => onUpdate({ ...column, name: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
          Type
          <select
            value={column.type}
            onChange={(event) => {
              const nextType = event.target.value;
              const option = mysqlDataTypeOptions.find((item) => item.value === nextType);
              onUpdate({
                ...column,
                type: nextType,
                length:
                  option?.supportsLength
                    ? column.length && column.length.trim() !== ""
                      ? column.length
                      : option.defaultLength ?? ""
                    : "",
                unsigned: option?.numeric ? column.unsigned : false,
                autoIncrement: option?.autoIncrementOnly ? column.autoIncrement : false,
              });
            }}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
          >
            {mysqlDataTypeOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {showLength && (
          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
            Length
            <input
              value={column.length ?? ""}
              onChange={(event) => onUpdate({ ...column, length: event.target.value })}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
              placeholder={dataType?.defaultLength ?? ""}
            />
          </label>
        )}
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
          Nullability
          <div className="flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={!column.nullable}
                onChange={() => onUpdate({ ...column, nullable: false })}
              />
              <span>Not null</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={column.nullable}
                onChange={() => onUpdate({ ...column, nullable: true })}
              />
              <span>Nullable</span>
            </label>
          </div>
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
          Default
          <div className="flex flex-col gap-2">
            <select
              value={column.defaultType}
              onChange={(event) => onUpdate({ ...column, defaultType: event.target.value as MysqlDefaultType })}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
            >
              <option value="none" className="bg-slate-900">
                None
              </option>
              <option value="value" className="bg-slate-900">
                Literal value
              </option>
              <option value="expression" className="bg-slate-900">
                SQL expression
              </option>
            </select>
            {column.defaultType !== "none" && (
              <input
                value={column.defaultValue}
                onChange={(event) => onUpdate({ ...column, defaultValue: event.target.value })}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                placeholder={column.defaultType === "expression" ? "CURRENT_TIMESTAMP" : "e.g. example"}
              />
            )}
          </div>
        </label>
        {showUnsigned && (
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
            <input
              type="checkbox"
              checked={column.unsigned}
              onChange={(event) => onUpdate({ ...column, unsigned: event.target.checked })}
            />
            Unsigned
          </label>
        )}
        {allowPrimaryKey && (
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
            <input
              type="checkbox"
              checked={column.primaryKey}
              onChange={(event) => onUpdate({ ...column, primaryKey: event.target.checked })}
            />
            Primary key
          </label>
        )}
        {allowAutoIncrement && (
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
            <input
              type="checkbox"
              checked={column.autoIncrement}
              onChange={(event) => onUpdate({ ...column, autoIncrement: event.target.checked })}
            />
            Auto increment
          </label>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="h-fit rounded-full border border-white/10 bg-rose-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-rose-200 transition hover:bg-rose-500/20"
      >
        Remove column
      </button>
    </div>
  );
}

function SqlPreviewPanel({ value }: { value: string }) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-slate-100">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">SQL Preview</h2>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(value);
          }}
          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
        >
          Copy
        </button>
      </div>
      <pre className="max-h-96 overflow-auto rounded-2xl bg-black/40 p-4 font-mono text-xs leading-relaxed text-cyan-100">
        {value || "-- Configure tables to generate SQL"}
      </pre>
    </div>
  );
}

function SummaryPanel({ tableCount, columnCount }: { tableCount: number; columnCount: number }) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl shadow-cyan-900/20">
      <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Schema summary</h2>
      <dl className="grid gap-3 text-xs uppercase tracking-[0.35em] text-cyan-100">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-[11px]">
          <dt>Tables</dt>
          <dd className="text-slate-100">{tableCount}</dd>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-[11px]">
          <dt>Columns</dt>
          <dd className="text-slate-100">{columnCount}</dd>
        </div>
      </dl>
    </div>
  );
}

function TipsPanel() {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl shadow-purple-900/20">
      <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/80">Tips</h2>
      <ul className="list-disc space-y-2 pl-5 text-xs text-slate-300">
        <li>Mark multiple columns as primary key to generate composite keys.</li>
        <li>Choose "SQL expression" for defaults like CURRENT_TIMESTAMP or JSON_OBJECT().</li>
        <li>Unsigned and auto-increment options automatically format integer types.</li>
      </ul>
    </div>
  );
}
