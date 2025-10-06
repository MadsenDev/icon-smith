import ColorThief from "colorthief";

export type PaletteColor = {
  hex: string;
  rgb: [number, number, number];
};

export async function extractPalette(
  image: HTMLImageElement,
  count = 8,
): Promise<PaletteColor[]> {
  const thief = new ColorThief();
  const palette = thief.getPalette(image, count, 4) as [number, number, number][];
  return palette.map((rgb) => ({
    rgb,
    hex: rgbToHex(rgb),
  }));
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalised = hex.replace(/^#/, "");
  const value = normalised.length === 3
    ? normalised.split("").map((ch) => ch + ch).join("")
    : normalised;
  const int = parseInt(value, 16);
  return [
    (int >> 16) & 255,
    (int >> 8) & 255,
    int & 255,
  ];
}

export function paletteToTailwind(palette: PaletteColor[]): string {
  const entries = palette
    .map((color, index) => `      ${50 + index * 100}: "${color.hex}"`)
    .join(",\n");

  return `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
${entries}
        }
      }
    }
  }
};
`;
}

export function paletteToCssVariables(palette: PaletteColor[]): string {
  const body = palette
    .map((color, index) => `  --palette-${index + 1}: ${color.hex};`)
    .join("\n");
  return `:root {
${body}
}
`;
}

export function paletteToJson(palette: PaletteColor[]): string {
  const serialisable = palette.map((color, index) => ({
    id: index + 1,
    hex: color.hex,
    rgb: color.rgb,
  }));
  return `${JSON.stringify(serialisable, null, 2)}
`;
}
