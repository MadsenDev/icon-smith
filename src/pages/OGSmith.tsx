import { useMemo, useRef, useState } from "react";
import { loadImageFromFile } from "../utils/image";
import { paletteToCssVariables } from "../utils/palette";

type Template = "hero" | "minimal" | "spotlight" | "split";
type Aspect = "1200x630" | "1600x900" | "1080x1080";

type UploadedImage = {
  file: File;
  url: string;
};

const aspects: Record<Aspect, { width: number; height: number; label: string }> = {
  "1200x630": { width: 1200, height: 630, label: "OpenGraph (1200×630)" },
  "1600x900": { width: 1600, height: 900, label: "YouTube / Widescreen" },
  "1080x1080": { width: 1080, height: 1080, label: "Square (Instagram)" },
};

const fontOptions = [
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'IBM Plex Sans', sans-serif", label: "IBM Plex" },
  { value: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta Sans" },
  { value: "'DM Sans', sans-serif", label: "DM Sans" },
];

const templateOptions: { value: Template; label: string; description: string }[] = [
  { value: "hero", label: "Hero", description: "Big title focus, subtle gradient." },
  { value: "minimal", label: "Minimal", description: "Clean layout with left-aligned text." },
  { value: "spotlight", label: "Spotlight", description: "Accent badge + spotlight effect." },
  { value: "split", label: "Split", description: "Two-column panel with accent block." },
];

const palettePresets = [
  {
    name: "Aurora",
    primary: "#4F46E5",
    secondary: "#06B6D4",
    background: "#0F172A",
    badge: "rgba(255,255,255,0.12)",
  },
  {
    name: "Sunset",
    primary: "#F97316",
    secondary: "#F43F5E",
    background: "#0A0A0A",
    badge: "rgba(255,255,255,0.1)",
  },
  {
    name: "Mono",
    primary: "#F3F4F6",
    secondary: "#9CA3AF",
    background: "#111827",
    badge: "rgba(255,255,255,0.05)",
  },
  {
    name: "Mint",
    primary: "#34D399",
    secondary: "#059669",
    background: "#052E16",
    badge: "rgba(52,211,153,0.12)",
  },
];

export default function OGSmithPage() {
  const [title, setTitle] = useState("Announcing IconSmith Suite");
  const [subtitle, setSubtitle] = useState("Browser-native tools for designers and developers. Icons, palettes, favicons, OG images, and more.");
  const [badge, setBadge] = useState("New release");
  const [template, setTemplate] = useState<Template>("hero");
  const [fontFamily, setFontFamily] = useState(fontOptions[0].value);
  const [aspect, setAspect] = useState<Aspect>("1200x630");
  const [accent, setAccent] = useState("#6366F1");
  const [secondaryAccent, setSecondaryAccent] = useState("#22D3EE");
  const [background, setBackground] = useState("#0F172A");
  const [badgeBackground, setBadgeBackground] = useState("rgba(255,255,255,0.12)");
  const [paletteJson, setPaletteJson] = useState("[");
  const [logo, setLogo] = useState<UploadedImage | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<UploadedImage | null>(null);
  const [showBackgroundOverlay, setShowBackgroundOverlay] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { width, height, label: aspectLabel } = aspects[aspect];
  const templateStyles = useMemo(
    () => buildTemplateStyles({ template, accent, secondaryAccent, background, badgeBackground }),
    [template, accent, secondaryAccent, background, badgeBackground],
  );

  const paletteCss = useMemo(() => {
    try {
      const parsed = JSON.parse(paletteJson);
      if (!Array.isArray(parsed)) return "";
      const colors = parsed
        .filter((entry) => typeof entry === "string" && entry.startsWith("#"))
        .slice(0, 10)
        .map((hex, index) => ({ hex, rgb: [0, 0, 0], id: index }));
      if (colors.length === 0) return "";
      return paletteToCssVariables(colors as any);
    } catch {
      return "";
    }
  }, [paletteJson]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">OGSmith</h1>
            <p className="text-sm text-slate-200/80">
              Craft Open Graph images with live templates, brand colours, and instant downloads. Export multiple aspect ratios for social platforms.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(aspects).map(([key, value]) => (
              <button
                key={key}
                type="button"
                className={`rounded-full border px-4 py-2 uppercase tracking-[0.35em] transition ${
                  aspect === key
                    ? "border-cyan-300 bg-cyan-500/30 text-white"
                    : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                }`}
                onClick={() => setAspect(key as Aspect)}
              >
                {value.label}
              </button>
            ))}
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white shadow-lg shadow-purple-500/20 transition hover:bg-white/20"
              onClick={() => downloadImage(canvasRef.current, width, height)}
            >
              Download PNG
            </button>
          </div>
        </div>
      </div>

      <section className="grid flex-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-blue-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Content</h2>
            <div className="mt-4 space-y-4">
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Title</span>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-cyan-300 focus:outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Subtitle</span>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-cyan-300 focus:outline-none"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Badge</span>
                <input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-cyan-300 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-purple-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Appearance</h2>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {templateOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.35em] transition ${
                      template === option.value
                        ? "border-cyan-300 bg-cyan-500/30 text-white"
                        : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                    }`}
                    onClick={() => setTemplate(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                  Accent
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    className="h-9 w-16 cursor-pointer rounded-full border border-white/20"
                  />
                </label>
                <label className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                  Secondary
                  <input
                    type="color"
                    value={secondaryAccent}
                    onChange={(e) => setSecondaryAccent(e.target.value)}
                    className="h-9 w-16 cursor-pointer rounded-full border border-white/20"
                  />
                </label>
                <label className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                  Background
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="h-9 w-16 cursor-pointer rounded-full border border-white/20"
                  />
                </label>
                <label className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                  Badge bg
                  <input
                    type="color"
                    value={badgeBackground}
                    onChange={(e) => setBadgeBackground(e.target.value)}
                    className="h-9 w-16 cursor-pointer rounded-full border border-white/20"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Font</p>
                <div className="flex flex-wrap gap-2">
                  {fontOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`rounded-full border px-4 py-2 text-xs transition ${
                        fontFamily === option.value
                          ? "border-cyan-300 bg-cyan-500/30 text-white"
                          : "border-white/10 bg-white/10 text-slate-200/80 hover:border-cyan-300/60"
                      }`}
                      onClick={() => setFontFamily(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Presets</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {palettePresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-white transition hover:border-cyan-300/60"
                      onClick={() => {
                        setAccent(preset.primary);
                        setSecondaryAccent(preset.secondary);
                        setBackground(preset.background);
                        setBadgeBackground(preset.badge);
                      }}
                    >
                      <span>{preset.name}</span>
                      <span className="flex h-6 w-14 overflow-hidden rounded-full">
                        <span className="flex-1" style={{ backgroundColor: preset.primary }} />
                        <span className="flex-1" style={{ backgroundColor: preset.secondary }} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Palette tokens (JSON array)</label>
                <textarea
                  value={paletteJson}
                  onChange={(e) => setPaletteJson(e.target.value)}
                  placeholder='["#6366F1", "#22D3EE", ...]'
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-white focus:border-cyan-300 focus:outline-none"
                />
                {paletteCss && (
                  <pre className="rounded-2xl border border-white/10 bg-black/60 p-3 font-mono text-[11px] text-cyan-100 shadow-inner shadow-cyan-900/30">{paletteCss}</pre>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80 shadow-2xl shadow-purple-900/20 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Brand assets</h2>
            <div className="mt-4 space-y-4">
              <AssetUploader
                label="Logo"
                asset={logo}
                onChange={(asset) => setLogo(asset)}
              />
              <AssetUploader
                label="Background image"
                asset={backgroundImage}
                onChange={(asset) => setBackgroundImage(asset)}
              />
              <label className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
                <input
                  type="checkbox"
                  checked={showBackgroundOverlay}
                  onChange={(e) => setShowBackgroundOverlay(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Overlay gradient for readability</span>
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-purple-900/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Preview</h2>
          <p className="mt-2 text-xs text-slate-200/70">{aspectLabel}. Click download to save a PNG.</p>
          <div
            ref={canvasRef}
            className="mt-4 w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/30"
            style={{
              aspectRatio: `${width} / ${height}`,
              background: templateStyles.background,
              fontFamily,
              position: "relative",
            }}
          >
            {backgroundImage && (
              <img
                src={backgroundImage.url}
                alt="Background"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: showBackgroundOverlay ? 0.4 : 1 }}
              />
            )}
            {showBackgroundOverlay && (
              <div className="absolute inset-0" style={templateStyles.overlay} />
            )}
            <div
              className="relative flex h-full flex-col justify-between"
              style={templateStyles.innerWrapper}
            >
              <div className="flex items-center justify-between px-12 pt-12">
                <span
                  className="rounded-full px-5 py-2 text-xs uppercase tracking-[0.4em] text-white/80"
                  style={{ backgroundColor: badgeBackground }}
                >
                  {badge}
                </span>
                {logo && (
                  <img
                    src={logo.url}
                    alt="Logo"
                    className="max-h-14 rounded-xl bg-white/10 px-4 py-2"
                  />
                )}
              </div>
              <div className="space-y-6 px-12 pb-14" style={templateStyles.contentLayer}>
                <h3 className="text-5xl font-semibold text-white md:text-6xl" style={templateStyles.titleStyle}>
                  {title || "Add your headline"}
                </h3>
                <p className="max-w-2xl text-lg text-white/80 md:text-xl" style={templateStyles.subtitleStyle}>
                  {subtitle || "Add a supporting subtitle to describe the share content."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type TemplateMeta = {
  template: Template;
  accent: string;
  secondary: string;
  background: string;
  badge: string;
};

type TemplateStyles = {
  background: string;
  overlay?: React.CSSProperties;
  innerWrapper?: React.CSSProperties;
  contentLayer?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  subtitleStyle?: React.CSSProperties;
};

function buildTemplateStyles(meta: TemplateMeta): TemplateStyles {
  const { template, accent, secondary, background, badge } = meta;

  switch (template) {
    case "minimal":
      return {
        background,
        overlay: {
          background: "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)",
        },
        innerWrapper: {
          padding: "60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        },
        contentLayer: {
          maxWidth: "70%",
        },
        titleStyle: {
          fontWeight: 600,
          letterSpacing: "-0.02em",
        },
        subtitleStyle: {
          color: "rgba(255,255,255,0.7)",
        },
      };
    case "spotlight":
      return {
        background: `radial-gradient(circle at 20% 20%, ${accent} 0%, ${background} 50%)`,
        overlay: {
          background: "linear-gradient(160deg, rgba(17, 17, 17, 0.8) 0%, rgba(17, 17, 17, 0.2) 60%, rgba(17, 17, 17, 0) 100%)",
        },
        innerWrapper: {
          backdropFilter: "blur(6px)",
        },
        contentLayer: {
          padding: "0 60px 60px",
        },
        titleStyle: {
          fontWeight: 700,
          letterSpacing: "-0.015em",
        },
      };
    case "split":
      return {
        background,
        overlay: {
          background: `linear-gradient(120deg, ${accent} 0%, ${accent} 45%, rgba(0,0,0,0.2) 60%, transparent 100%)`,
        },
        innerWrapper: {
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
        },
        contentLayer: {
          padding: "60px",
        },
        titleStyle: {
          fontWeight: 700,
        },
      };
    case "hero":
    default:
      return {
        background: `linear-gradient(140deg, ${accent} 0%, ${secondary} 45%, ${background} 100%)`,
        overlay: {
          background: "linear-gradient(140deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)",
        },
        innerWrapper: {},
        contentLayer: {},
        titleStyle: {
          fontWeight: 700,
          letterSpacing: "-0.015em",
        },
        subtitleStyle: {
          color: "rgba(255,255,255,0.75)",
        },
      };
  }
}

function downloadImage(node: HTMLDivElement | null, width: number, height: number) {
  if (!node) return;
  import("html2canvas").then(({ default: html2canvas }) => {
    html2canvas(node, {
      backgroundColor: null,
      width,
      height,
      scale: 2,
    }).then((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `og-${width}x${height}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    });
  });
}

type AssetUploaderProps = {
  label: string;
  asset: UploadedImage | null;
  onChange: (asset: UploadedImage | null) => void;
};

function AssetUploader({ label, asset, onChange }: AssetUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-slate-200/80">
      <div className="flex items-center justify-between">
        <p className="uppercase tracking-[0.35em] text-cyan-200/80">{label}</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white transition hover:bg-white/20"
            onClick={() => inputRef.current?.click()}
          >
            Upload
          </button>
          {asset && (
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white transition hover:bg-white/20"
              onClick={() => onChange(null)}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const img = await loadImageFromFile(file);
          onChange({ file, url: img.src });
        }}
      />
      {asset ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3">
          <img src={asset.url} alt={label} className="h-10 w-10 rounded object-cover" />
          <span className="text-[11px] text-slate-200/80">{asset.file.name}</span>
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-slate-200/60">PNG/SVG recommended. Transparent backgrounds work best for logos.</p>
      )}
    </div>
  );
}

