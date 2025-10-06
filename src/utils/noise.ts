export type NoiseVariant = "film" | "grain" | "speckle" | "dust" | "lines";

export type GenerateNoiseOptions = {
  width: number;
  height: number;
  variant: NoiseVariant;
  intensity: number;
  alpha: number;
  contrast: number;
  scale: number;
  seed: number;
  tint: string;
  tintStrength: number;
};

type RGB = { r: number; g: number; b: number };

export function generateNoiseCanvas(options: GenerateNoiseOptions): HTMLCanvasElement {
  if (typeof document === "undefined") {
    throw new Error("Noise generation requires a browser environment.");
  }

  const width = clamp(Math.floor(options.width), 16, 4096);
  const height = clamp(Math.floor(options.height), 16, 4096);
  const scaleFactor = clamp(options.scale, 1, 12);
  const baseWidth = clamp(Math.round(width / scaleFactor), 8, width);
  const baseHeight = clamp(Math.round(height / scaleFactor), 8, height);

  const canvas = document.createElement("canvas");
  canvas.width = baseWidth;
  canvas.height = baseHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to create 2D context for noise generation.");
  }

  const imageData = ctx.createImageData(baseWidth, baseHeight);
  const data = imageData.data;
  const rng = seededRandom(options.seed);
  const tint = parseColor(options.tint);
  const intensity = clamp(options.intensity, 0, 1);
  const alpha = clamp(options.alpha, 0, 1);
  const contrast = clamp(options.contrast, 0, 1);
  const tintStrength = clamp(options.tintStrength, 0, 1);

  for (let y = 0; y < baseHeight; y += 1) {
    for (let x = 0; x < baseWidth; x += 1) {
      const index = (y * baseWidth + x) * 4;
      let value = rng();

      switch (options.variant) {
        case "grain":
          value = (rng() + rng() + rng()) / 3;
          break;
        case "speckle": {
          const spikeChance = 0.87 + (1 - intensity) * 0.08;
          value = value > spikeChance ? 1 : value * 0.18;
          break;
        }
        case "dust": {
          const hotspot = 0.97 - intensity * 0.2;
          value = value > hotspot ? 1 : value * 0.08;
          break;
        }
        case "lines": {
          const period = Math.max(2, Math.round(10 - intensity * 6));
          if (y % period === 0) {
            value = Math.min(1, value + 0.5);
          } else {
            value *= 0.6;
          }
          break;
        }
        default:
          // film: leave value as-is
          break;
      }

      let brightness = applyContrast(value, contrast);
      brightness = brightness * intensity + 0.5 * (1 - intensity);
      brightness = clamp(brightness, 0, 1);

      const grey = Math.round(brightness * 255);
      const tinted = {
        r: Math.round(tint.r * brightness),
        g: Math.round(tint.g * brightness),
        b: Math.round(tint.b * brightness),
      };

      data[index] = Math.round(grey * (1 - tintStrength) + tinted.r * tintStrength);
      data[index + 1] = Math.round(grey * (1 - tintStrength) + tinted.g * tintStrength);
      data[index + 2] = Math.round(grey * (1 - tintStrength) + tinted.b * tintStrength);
      const pixelAlpha = clamp(alpha * (0.45 + brightness * 0.55), 0, 1);
      data[index + 3] = Math.round(pixelAlpha * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  if (baseWidth === width && baseHeight === height) {
    return canvas;
  }

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = width;
  finalCanvas.height = height;
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) {
    throw new Error("Unable to scale noise texture.");
  }
  finalCtx.imageSmoothingEnabled = false;
  finalCtx.drawImage(canvas, 0, 0, width, height);
  return finalCanvas;
}

export function generateNoiseDataUrl(options: GenerateNoiseOptions): string {
  const canvas = generateNoiseCanvas(options);
  return canvas.toDataURL("image/png");
}

export async function generateNoiseBlob(options: GenerateNoiseOptions, type = "image/png", quality?: number): Promise<Blob> {
  const canvas = generateNoiseCanvas(options);
  return canvasToBlob(canvas, type, quality);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert canvas to blob"));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

function applyContrast(value: number, contrast: number): number {
  const factor = contrast + 0.5;
  return clamp((value - 0.5) * factor + 0.5, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseColor(input: string): RGB {
  const value = input.trim();

  if (/^#([0-9a-f]{3})$/i.test(value)) {
    const hex = value.slice(1);
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  if (/^#([0-9a-f]{6})$/i.test(value)) {
    const hex = value.slice(1);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  const rgbaMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbaMatch) {
    return {
      r: clamp(Number.parseInt(rgbaMatch[1], 10), 0, 255),
      g: clamp(Number.parseInt(rgbaMatch[2], 10), 0, 255),
      b: clamp(Number.parseInt(rgbaMatch[3], 10), 0, 255),
    };
  }

  return { r: 255, g: 255, b: 255 };
}

function seededRandom(seed: number): () => number {
  let value = Math.abs(Math.floor(seed)) % 2147483647;
  if (value === 0) value = 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

