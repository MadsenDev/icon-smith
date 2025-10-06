import { useMemo, useState } from "react";
import { ComingSoon } from "../components/ComingSoon";

type FieldType = "text" | "email" | "password" | "number" | "textarea" | "select" | "checkbox";

type FormField = {
  id: string;
  label: string;
  name: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helper?: string;
  options?: string;
};

const defaultFields: FormField[] = [
  { id: "field-1", label: "Name", name: "name", type: "text", required: true, placeholder: "Jane Doe" },
  { id: "field-2", label: "Email", name: "email", type: "email", required: true, placeholder: "user@example.com" },
  { id: "field-3", label: "Message", name: "message", type: "textarea", required: false, helper: "How can we help?" },
];

export default function FormSmithPage() {
  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [formName, setFormName] = useState("Contact form");

  const htmlExport = useMemo(() => {
    const lines = ["<form class=\"space-y-4\" method=\"post\">"];
    fields.forEach((field) => {
      lines.push("  <div class=\"grid gap-1\">");
      lines.push(`    <label for=\"${field.name}\" class=\"text-sm font-medium text-slate-200\">${field.label}${field.required ? " *" : ""}</label>`);
      if (field.type === "textarea") {
        lines.push(
          `    <textarea id=\"${field.name}\" name=\"${field.name}\" placeholder=\"${field.placeholder ?? ""}\" class=\"rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white\"${field.required ? " required" : ""}></textarea>`,
        );
      } else if (field.type === "select") {
        const options = field.options?.split(",").map((option) => option.trim()).filter(Boolean) ?? [];
        lines.push(`    <select id=\"${field.name}\" name=\"${field.name}\" class=\"rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white\"${field.required ? " required" : ""}>`);
        options.forEach((option) => {
          lines.push(`      <option value=\"${option.toLowerCase()}\">${option}</option>`);
        });
        lines.push("    </select>");
      } else {
        const inputType = field.type === "checkbox" ? "checkbox" : field.type;
        lines.push(
          `    <input id=\"${field.name}\" name=\"${field.name}\" type=\"${inputType}\" placeholder=\"${field.placeholder ?? ""}\" class=\"${field.type === "checkbox" ? "h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-400" : "rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"}\"${field.required ? " required" : ""} />`,
        );
      }
      if (field.helper) {
        lines.push(`    <p class=\"text-xs text-slate-400\">${field.helper}</p>`);
      }
      lines.push("  </div>");
    });
    lines.push("  <button type=\"submit\" class=\"rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100\">Submit</button>");
    lines.push("</form>");
    return lines.join("\n");
  }, [fields]);

  const reactHookFormExport = useMemo(() => {
    const registerLines = fields
      .map((field) => {
        const validators: string[] = [];
        if (field.required) validators.push("required: 'Required'");
        if (field.type === "email") validators.push("pattern: { value: /.+@.+\\..+/, message: 'Invalid email' }");
        return `    <div className=\"grid gap-1\">\n` +
          `      <label htmlFor=\"${field.name}\" className=\"text-sm font-medium text-slate-200\">${field.label}${field.required ? " *" : ""}</label>\n` +
          (field.type === "textarea"
            ? `      <textarea id=\"${field.name}\" {...register('${field.name}', { ${validators.join(", ")} })} className=\"rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white\" placeholder=\"${field.placeholder ?? ""}\" />\n`
            : `      <input id=\"${field.name}\" type=\"${field.type}\" {...register('${field.name}', { ${validators.join(", ")} })} className=\"rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white\" placeholder=\"${field.placeholder ?? ""}\" />\n`) +
          `      {errors.${field.name} && <p className=\"text-xs text-rose-400\">{errors.${field.name}?.message}</p>}\n` +
          `    </div>`;
      })
      .join("\n\n");

    return `import { useForm } from "react-hook-form";\n\n` +
      `type ${formName.replace(/\s+/g, "")}Form = {\n${fields
        .map((field) => `  ${field.name}: ${field.type === "checkbox" ? "boolean" : "string"};`)
        .join("\n")}\n};\n\n` +
      `export function ${formName.replace(/\s+/g, "")}Form() {\n` +
      `  const { register, handleSubmit, formState: { errors } } = useForm<${formName.replace(/\s+/g, "")}Form>();\n` +
      `  const onSubmit = handleSubmit((data) => console.log(data));\n\n` +
      `  return (\n` +
      `    <form onSubmit={onSubmit} className=\"space-y-4\">\n${registerLines}\n      <button type=\"submit\" className=\"rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100\">Submit</button>\n    </form>\n  );\n}`;
  }, [fields, formName]);

  const zodSchemaExport = useMemo(() => {
    const schemaFields = fields
      .map((field) => {
        const rules: string[] = [];
        if (field.type === "email") {
          rules.push("z.string().email()" + (field.required ? ".min(1)" : ".optional()"));
        } else if (field.type === "number") {
          rules.push("z.number()" + (field.required ? ".min(0)" : ".optional()"));
        } else if (field.type === "checkbox") {
          rules.push("z.boolean()" + (field.required ? ".refine(val => val === true, 'Required')" : ""));
        } else {
          rules.push("z.string()" + (field.required ? ".min(1)" : ".optional()"));
        }
        return `  ${field.name}: ${rules.join(" ")}`;
      })
      .join(",\n");

    return `import { z } from "zod";\n\n` + `export const ${formName.replace(/\s+/g, "")}Schema = z.object({\n${schemaFields}\n});`;
  }, [fields, formName]);

  const handleFieldUpdate = (id: string, update: Partial<FormField>) => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...update } : field)));
  };

  const addField = () => {
    const nextNumber = fields.length + 1;
    setFields((prev) => [
      ...prev,
      {
        id: `field-${nextNumber}`,
        label: `Field ${nextNumber}`,
        name: `field_${nextNumber}`,
        type: "text",
        required: false,
      },
    ]);
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">FormSmith</h1>
            <p className="text-sm text-slate-200/80">
              Visually compose form structures, map to HTML or React Hook Form, and export Zod validation schemas.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-slate-200">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
              Form name
              <input
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <button
              type="button"
              onClick={addField}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/20"
            >
              Add field
            </button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="space-y-6 min-w-0">
          {fields.length === 0 ? (
            <ComingSoon
              title="Add your first field"
              description="Define inputs, validations, and helper text. Export HTML, React Hook Form, or Zod schemas instantly"
            />
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-xl shadow-blue-900/20">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">{field.label}</h2>
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-rose-200 transition hover:bg-rose-500/20"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      Label
                      <input
                        value={field.label}
                        onChange={(event) => handleFieldUpdate(field.id, { label: event.target.value })}
                        className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                    <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      Field name
                      <input
                        value={field.name}
                        onChange={(event) => handleFieldUpdate(field.id, { name: event.target.value })}
                        className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      Type
                      <select
                        value={field.type}
                        onChange={(event) => handleFieldUpdate(field.id, { type: event.target.value as FieldType })}
                        className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="password">Password</option>
                        <option value="number">Number</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Select</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(event) => handleFieldUpdate(field.id, { required: event.target.checked })}
                        className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
                      />
                      Required
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      Placeholder
                      <input
                        value={field.placeholder ?? ""}
                        onChange={(event) => handleFieldUpdate(field.id, { placeholder: event.target.value })}
                        className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                    <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      Helper text
                      <input
                        value={field.helper ?? ""}
                        onChange={(event) => handleFieldUpdate(field.id, { helper: event.target.value })}
                        className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                  </div>
                  {field.type === "select" && (
                    <label className="grid gap-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                      Options (comma separated)
                      <input
                        value={field.options ?? ""}
                        onChange={(event) => handleFieldUpdate(field.id, { options: event.target.value })}
                        className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none"
                        placeholder="Basic, Pro, Enterprise"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="flex min-w-0 flex-col gap-6">
          <ExportCard title="HTML markup" code={htmlExport} />
          <ExportCard title="React Hook Form" code={reactHookFormExport} />
          <ExportCard title="Zod schema" code={zodSchemaExport} />
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
      <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-900/80">
        <pre className="max-h-64 min-w-full px-4 py-4 text-xs text-slate-200">
          <code className="whitespace-pre-wrap break-words text-left">{code}</code>
        </pre>
      </div>
    </div>
  );
}

