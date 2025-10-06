export type ShadowPresetKey = "soft" | "sharp" | "layered" | "glow" | "glass" | "neon";

export type ShadowStop = {
  blur: number;
  spread: number;
  opacity: number;
  offsetX: number;
  offsetY: number;
  color: string;
};

export type ShadowRecipe = {
  key: ShadowPresetKey;
  label: string;
  description: string;
  stops: ShadowStop[];
  background?: string;
};

export const presets: Record<ShadowPresetKey, ShadowRecipe> = {
  soft: {
    key: "soft",
    label: "Soft ambient",
    description: "Subtle drop shadow for cards and panels.",
    background: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.95))",
    stops: [
      { blur: 30, spread: -10, opacity: 0.25, offsetX: 0, offsetY: 20, color: "0,0,0" },
      { blur: 12, spread: -6, opacity: 0.18, offsetX: 0, offsetY: 6, color: "15,23,42" },
    ],
  },
  sharp: {
    key: "sharp",
    label: "Sharp shadow",
    description: "High contrast, directional shadow for modals.",
    background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(2,6,23,0.9))",
    stops: [
      { blur: 18, spread: -4, opacity: 0.28, offsetX: 0, offsetY: 18, color: "15,23,42" },
      { blur: 6, spread: -2, opacity: 0.2, offsetX: 0, offsetY: 4, color: "0,0,0" },
    ],
  },
  layered: {
    key: "layered",
    label: "Layered",
    description: "Multi-layer depth for elevated surfaces.",
    background: "linear-gradient(135deg, rgba(30,64,175,0.3), rgba(17,24,39,0.9))",
    stops: [
      { blur: 45, spread: -15, opacity: 0.32, offsetX: 0, offsetY: 32, color: "15,23,42" },
      { blur: 20, spread: -8, opacity: 0.26, offsetX: 0, offsetY: 12, color: "8,47,73" },
      { blur: 8, spread: -4, opacity: 0.18, offsetX: 0, offsetY: 4, color: "15,23,42" },
    ],
  },
  glow: {
    key: "glow",
    label: "Ambient glow",
    description: "Soft glow for floating elements and badges.",
    background: "radial-gradient(circle at top, rgba(56,189,248,0.2), transparent)",
    stops: [
      { blur: 40, spread: 12, opacity: 0.35, offsetX: 0, offsetY: 0, color: "56,189,248" },
      { blur: 18, spread: 6, opacity: 0.25, offsetX: 0, offsetY: 0, color: "58,123,213" },
    ],
  },
  glass: {
    key: "glass",
    label: "Glassmorphism",
    description: "Frosted glass panel reflections.",
    background: "linear-gradient(135deg, rgba(148,163,184,0.15), rgba(100,116,139,0.05))",
    stops: [
      { blur: 26, spread: -10, opacity: 0.35, offsetX: 0, offsetY: 18, color: "15,23,42" },
      { blur: 10, spread: -6, opacity: 0.4, offsetX: 0, offsetY: 6, color: "148,163,184" },
      { blur: 4, spread: -1, opacity: 0.8, offsetX: 0, offsetY: 1, color: "255,255,255" },
    ],
  },
  neon: {
    key: "neon",
    label: "Neon aura",
    description: "Vibrant neon-like glow for call-to-actions.",
    background: "radial-gradient(circle at center, rgba(236,72,153,0.25), transparent)",
    stops: [
      { blur: 52, spread: 22, opacity: 0.58, offsetX: 0, offsetY: 0, color: "56,189,248" },
      { blur: 20, spread: 10, opacity: 0.55, offsetX: 0, offsetY: 0, color: "139,92,246" },
      { blur: 8, spread: 0, opacity: 0.65, offsetX: 0, offsetY: 0, color: "236,72,153" },
    ],
  },
};

export function formatBoxShadow(stops: ShadowStop[]): string {
  return stops
    .map((stop) => `${stop.offsetX}px ${stop.offsetY}px ${stop.blur}px ${stop.spread}px rgba(${stop.color}, ${stop.opacity})`)
    .join(", ");
}

export function formatTailwind(stops: ShadowStop[]): string {
  return formatBoxShadow(stops);
}

export function formatCssFilter(stops: ShadowStop[]): string {
  return stops
    .map((stop) => `drop-shadow(${stop.offsetX}px ${stop.offsetY}px ${stop.blur}px rgba(${stop.color}, ${stop.opacity}))`)
    .join(" ");
}

export function buildGlassBackdrop({ blur, transparency }: { blur: number; transparency: number }): string {
  return `backdrop-filter: blur(${blur}px); background: rgba(15, 23, 42, ${transparency}); border: 1px solid rgba(255, 255, 255, 0.15);`;
}

