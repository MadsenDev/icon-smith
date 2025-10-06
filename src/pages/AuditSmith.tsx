import { useMemo, useState } from "react";
import { contrastRatio, getContrastRating, parseColor, suggestAdjustments, toHex } from "../utils/contrast";

type IssueSeverity = "critical" | "warning" | "info" | "success";

type AuditIssue = {
  id: string;
  severity: IssueSeverity;
  title: string;
  detail: string;
};

const severityStyles: Record<IssueSeverity, string> = {
  critical: "border-rose-500/40 bg-rose-500/20",
  warning: "border-amber-400/40 bg-amber-500/15",
  info: "border-sky-400/40 bg-sky-500/15",
  success: "border-emerald-400/40 bg-emerald-500/15",
};

function extractIssues(html: string): AuditIssue[] {
  const issues: AuditIssue[] = [];
  if (!html.trim()) {
    issues.push({
      id: "empty",
      severity: "info",
      title: "No markup provided",
      detail: "Paste HTML or JSX snippets to analyse for accessibility opportunities.",
    });
    return issues;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body;

  const images = Array.from(root.querySelectorAll("img"));
  images
    .filter((img) => !img.hasAttribute("alt") || img.getAttribute("alt")?.trim() === "")
    .forEach((img, index) => {
      issues.push({
        id: `img-alt-${index}`,
        severity: "critical",
        title: "Image missing alternative text",
        detail: `Add descriptive alt text for image with src \"${img.getAttribute("src") ?? "?"}\". Decorative images should use empty alt attributes (alt=\"\").`,
      });
    });

  const buttons = Array.from(root.querySelectorAll("button"));
  buttons
    .filter((btn) => btn.textContent?.trim() === "" && !btn.getAttribute("aria-label") && !btn.getAttribute("aria-labelledby"))
    .forEach((_, index) => {
      issues.push({
        id: `button-label-${index}`,
        severity: "critical",
        title: "Button lacks accessible label",
        detail: "Ensure the button has visible text, an aria-label, or is associated with labelled content.",
      });
    });

  const headings = Array.from(root.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  if (headings.length > 0) {
    const sequence = headings.map((heading) => Number.parseInt(heading.tagName.replace("H", ""), 10));
    for (let i = 1; i < sequence.length; i += 1) {
      if (sequence[i] - sequence[i - 1] > 1) {
        issues.push({
          id: `heading-order-${i}`,
          severity: "warning",
          title: "Heading level skipped",
        detail: `Heading level jumped from H${sequence[i - 1]} to H${sequence[i]}. Keep sequential order for assistive tech.`,
        });
      }
    }
  }

  const links = Array.from(root.querySelectorAll("a"));
  links
    .filter((link) => link.getAttribute("href") === "#" || link.getAttribute("href") === "")
    .forEach((_, index) => {
      issues.push({
        id: `link-target-${index}`,
        severity: "warning",
        title: "Link lacks meaningful href",
        detail: "Replace placeholder href values (like #) with actual destinations or use a button element for actions.",
      });
    });

  const inputs = Array.from(root.querySelectorAll("input, textarea, select"));
  inputs
    .filter((field) => {
      const id = field.getAttribute("id");
      if (!id) return true;
      const label = root.querySelector(`label[for='${id}']`);
      const ariaLabelledby = field.getAttribute("aria-labelledby");
      const ariaLabel = field.getAttribute("aria-label");
      return !label && !ariaLabelledby && !ariaLabel;
    })
    .forEach((field, index) => {
      issues.push({
        id: `form-label-${index}`,
        severity: "critical",
        title: "Form control missing label",
        detail: `Provide a label element or aria attributes for the ${field.tagName.toLowerCase()} control.`,
      });
    });

  const autoPlayMedia = Array.from(root.querySelectorAll("video[autoplay], audio[autoplay]"));
  if (autoPlayMedia.length > 0) {
    issues.push({
      id: "autoplay",
      severity: "warning",
      title: "Media autoplays",
      detail: "Avoid autoplaying audio/video or provide controls to pause immediately.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      id: "all-good",
      severity: "success",
      title: "No structural issues detected",
      detail: "Markup looks healthy. Double-check colour contrast and interactive focus states.",
    });
  }

  return issues;
}

function buildContrastResult(foreground: string, background: string) {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;
  const ratio = contrastRatio(fg, bg);
  const rating = getContrastRating(ratio);
  const adjustments = suggestAdjustments(fg, bg);
  return { ratio: Number.parseFloat(ratio.toFixed(2)), rating, adjustments, foreground: fg, background: bg };
}

export default function AuditSmithPage() {
  const [html, setHtml] = useState(
    `<header>\n  <h1>Launch page</h1>\n  <nav>\n    <a href="#">Home</a>\n    <a href="#">Docs</a>\n  </nav>\n</header>\n<main>\n  <img src="hero.jpg" />\n  <button class="icon-only">\n    <svg aria-hidden="true"></svg>\n  </button>\n</main>`
  );
  const [foreground, setForeground] = useState("#111827");
  const [background, setBackground] = useState("#F9FAFB");

  const issues = useMemo(() => extractIssues(html), [html]);
  const contrastResult = useMemo(() => buildContrastResult(foreground, background), [foreground, background]);

  return (
    <div className="space-y-10 text-slate-200">
      <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Audit playground</p>
            <h2 className="text-xl font-semibold text-white">Paste markup for quick checks</h2>
          </header>
          <label className="grid gap-2 text-sm">
            <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Markup snippet</span>
            <textarea
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              rows={16}
              className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400/60"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Foreground colour</span>
              <input
                value={foreground}
                onChange={(event) => setForeground(event.target.value)}
                placeholder="#111827"
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Background colour</span>
              <input
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                placeholder="#F9FAFB"
                className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
              />
            </label>
          </div>
          {contrastResult ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Contrast report</p>
              <p className="mt-2 text-lg font-semibold text-white">{contrastResult.ratio}:1</p>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Rating: {contrastResult.rating}</p>
              <div className="mt-4 flex gap-4">
                <div className="flex-1 rounded-xl border border-white/10" style={{ background: background }}>
                  <div className="p-4 text-sm" style={{ color: foreground }}>
                    <p className="font-semibold">Preview</p>
                    <p className="text-xs">Foreground vs background sample</p>
                  </div>
                </div>
              </div>
              {contrastResult.adjustments.length > 0 && (
                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">Suggested fixes</p>
                  {contrastResult.adjustments.map((adjustment, index) => (
                    <p key={`${adjustment.color}-${index}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <span className="font-semibold text-white">{adjustment.goal}:</span> {adjustment.target} should {adjustment.direction} to
                      {" "}
                      <span className="text-cyan-200">{adjustment.color}</span> ({adjustment.ratio.toFixed(2)}:1)
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-500/15 p-4 text-xs text-amber-100">
              Provide valid hex or rgb colours to evaluate contrast.
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
            <header className="mb-4 space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Issue log</p>
              <h2 className="text-xl font-semibold text-white">Accessibility checklist</h2>
              <p className="text-xs text-slate-300">Automated heuristics surface common pitfalls. Always test with users and assistive technology.</p>
            </header>
            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={issue.id} className={`rounded-2xl border px-4 py-3 text-sm ${severityStyles[issue.severity]}`}>
                  <p className="font-medium text-white">{issue.title}</p>
                  <p className="text-xs text-slate-100/80">{issue.detail}</p>
                </div>
              ))}
            </div>
          </div>
          {contrastResult && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-900/20">
              <header className="space-y-1">
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Colour tokens</p>
                <h2 className="text-xl font-semibold text-white">Drop these into design tokens</h2>
              </header>
              <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-200">
                <code>{`{
  "foreground": "${toHex(contrastResult.foreground)}",
  "background": "${toHex(contrastResult.background)}",
  "contrastRatio": ${contrastResult.ratio},
  "rating": "${contrastResult.rating}"
}`}</code>
              </pre>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard
                    .writeText(
                      JSON.stringify(
                        {
                          foreground: toHex(contrastResult.foreground),
                          background: toHex(contrastResult.background),
                          contrastRatio: contrastResult.ratio,
                          rating: contrastResult.rating,
                        },
                        null,
                        2,
                      ),
                    )
                    .catch(() => {})
                }
                className="mt-4 inline-flex items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100 transition hover:bg-cyan-500/30"
              >
                Copy JSON
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
