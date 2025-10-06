export type RGB = [number, number, number];

const HEX_SHORT_REGEX = /^#([0-9a-f]{3})$/i;
const HEX_LONG_REGEX = /^#([0-9a-f]{6})$/i;
const RGB_REGEX = /^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;

export function parseColor(input: string): RGB | null {
  const value = input.trim();

  if (HEX_SHORT_REGEX.test(value)) {
    const [, hex] = value.match(HEX_SHORT_REGEX)!;
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return [r, g, b];
  }

  if (HEX_LONG_REGEX.test(value)) {
    const [, hex] = value.match(HEX_LONG_REGEX)!;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }

  if (RGB_REGEX.test(value)) {
    const [, rs, gs, bs] = value.match(RGB_REGEX)!;
    const r = clamp255(Number.parseInt(rs, 10));
    const g = clamp255(Number.parseInt(gs, 10));
    const b = clamp255(Number.parseInt(bs, 10));
    return [r, g, b];
  }

  return null;
}

export function toHex([r, g, b]: RGB): string {
  return `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`;
}

function toHexPair(value: number): string {
  return clamp255(Math.round(value)).toString(16).padStart(2, "0").toUpperCase();
}

function clamp255(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(255, value));
}

export function relativeLuminance([r, g, b]: RGB): number {
  const srgb = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];

  return srgb[0] * 0.2126 + srgb[1] * 0.7152 + srgb[2] * 0.0722;
}

export function contrastRatio(foreground: RGB, background: RGB): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastRating = "AAA" | "AA" | "AA Large" | "Fail";

export function getContrastRating(ratio: number): ContrastRating {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

export function bestOnBackground(bgColor: RGB): { color: RGB; ratio: number; rating: ContrastRating } {
  const white: RGB = [255, 255, 255];
  const black: RGB = [0, 0, 0];
  const contrastWithWhite = contrastRatio(white, bgColor);
  const contrastWithBlack = contrastRatio(black, bgColor);
  if (contrastWithWhite === contrastWithBlack) {
    return {
      color: white,
      ratio: contrastWithWhite,
      rating: getContrastRating(contrastWithWhite),
    };
  }
  if (contrastWithWhite > contrastWithBlack) {
    return {
      color: white,
      ratio: contrastWithWhite,
      rating: getContrastRating(contrastWithWhite),
    };
  }
  return {
    color: black,
    ratio: contrastWithBlack,
    rating: getContrastRating(contrastWithBlack),
  };
}

export type AdjustmentRecommendation = {
  target: "foreground" | "background";
  direction: "lighten" | "darken";
  ratio: number;
  color: string;
  goal: ContrastRating;
};

export function suggestAdjustments(foreground: RGB, background: RGB): AdjustmentRecommendation[] {
  const desiredLevels: Array<{ label: ContrastRating; ratio: number }> = [
    { label: "AAA", ratio: 7 },
    { label: "AA", ratio: 4.5 },
  ];

  const current = contrastRatio(foreground, background);
  const recommendations: AdjustmentRecommendation[] = [];

  desiredLevels.forEach(({ ratio, label }) => {
    if (current >= ratio) return;

    const towardsWhite = mixUntilRatio(foreground, background, ratio, [255, 255, 255]);
    const towardsBlack = mixUntilRatio(foreground, background, ratio, [0, 0, 0]);
    const adjustBackgroundLighten = mixUntilRatio(background, foreground, ratio, [255, 255, 255]);
    const adjustBackgroundDarken = mixUntilRatio(background, foreground, ratio, [0, 0, 0]);

    const candidates = [
      towardsWhite && { target: "foreground", direction: "lighten" as const, goal: label, ...towardsWhite },
      towardsBlack && { target: "foreground", direction: "darken" as const, goal: label, ...towardsBlack },
      adjustBackgroundLighten && { target: "background", direction: "lighten" as const, goal: label, ...adjustBackgroundLighten },
      adjustBackgroundDarken && { target: "background", direction: "darken" as const, goal: label, ...adjustBackgroundDarken },
    ].filter(Boolean) as AdjustmentRecommendation[];

    candidates.sort((a, b) => a.ratio - b.ratio);
    const best = candidates[0];
    if (best) {
      recommendations.push(best);
    }
  });

  return recommendations;
}

function mixUntilRatio(color: RGB, other: RGB, targetRatio: number, towards: RGB): { ratio: number; color: string } | null {
  const steps = 50;
  for (let i = 1; i <= steps; i += 1) {
    const amount = i / steps;
    const mixed = mix(color, towards, amount);
    const ratio = contrastRatio(mixed, other);
    if (ratio >= targetRatio) {
      return { ratio, color: toHex(mixed) };
    }
  }
  return null;
}

function mix(start: RGB, end: RGB, amount: number): RGB {
  return [
    start[0] + (end[0] - start[0]) * amount,
    start[1] + (end[1] - start[1]) * amount,
    start[2] + (end[2] - start[2]) * amount,
  ];
}

