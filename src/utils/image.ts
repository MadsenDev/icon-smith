export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function renderToCanvas(
  src: HTMLImageElement,
  size: number,
  padPct = 0,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to get 2D context");
  }
  ctx.clearRect(0, 0, size, size);

  const inner = Math.round(size * (1 - padPct * 2));
  const ratio = Math.min(inner / src.naturalWidth, inner / src.naturalHeight);
  const w = Math.round(src.naturalWidth * ratio);
  const h = Math.round(src.naturalHeight * ratio);
  const x = Math.round((size - w) / 2);
  const y = Math.round((size - h) / 2);
  ctx.drawImage(src, x, y, w, h);
  return c;
}

export async function canvasToPNGBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    c.toBlob((b) => {
      if (!b) {
        reject(new Error("Failed to convert canvas to blob"));
        return;
      }
      resolve(b);
    }, "image/png");
  });
}

export function toMonochromeWhite(srcCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = srcCanvas.width;
  c.height = srcCanvas.height;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to get 2D context");
  }
  ctx.drawImage(srcCanvas, 0, 0);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a !== 0) {
      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

