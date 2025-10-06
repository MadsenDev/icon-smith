type ImageWithIntrinsic = HTMLImageElement & {
  dataset: DOMStringMap & {
    intrinsicWidth?: string;
    intrinsicHeight?: string;
  };
};

function parseSvgLength(value: string | null): number | null {
  if (!value) return null;
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function inferSvgDimensions(svgText: string): { width: number; height: number } | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svgEl = doc.documentElement;
  if (!svgEl || svgEl.nodeName.toLowerCase() !== "svg") {
    return null;
  }

  let width = parseSvgLength(svgEl.getAttribute("width"));
  let height = parseSvgLength(svgEl.getAttribute("height"));

  if ((!width || !height) && svgEl.hasAttribute("viewBox")) {
    const viewBox = svgEl.getAttribute("viewBox")?.trim();
    if (viewBox) {
      const parts = viewBox
        .replace(/,/g, " ")
        .split(/\s+/)
        .map((part) => Number.parseFloat(part))
        .filter((num) => Number.isFinite(num));
      if (parts.length === 4) {
        const [, , vbWidth, vbHeight] = parts;
        width = width ?? (vbWidth > 0 ? vbWidth : null);
        height = height ?? (vbHeight > 0 ? vbHeight : null);
      }
    }
  }

  if (width && height) {
    return { width, height };
  }

  return null;
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const img = new Image();

  try {
    const loadedImg = await new Promise<ImageWithIntrinsic>((resolve, reject) => {
      img.onload = () => resolve(img as ImageWithIntrinsic);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });

    if (
      file.type.includes("svg") &&
      (loadedImg.naturalWidth === 0 || loadedImg.naturalHeight === 0)
    ) {
      try {
        const text = await file.text();
        const dimensions = inferSvgDimensions(text);
        if (dimensions) {
          loadedImg.dataset.intrinsicWidth = `${dimensions.width}`;
          loadedImg.dataset.intrinsicHeight = `${dimensions.height}`;
        }
      } catch (error) {
        // Ignore parsing failures and fall back to natural dimensions.
      }
    }

    return loadedImg;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function renderToCanvas(
  src: HTMLImageElement,
  size: number,
  padPct = 0,
  background: string | "transparent" = "transparent",
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to get 2D context");
  }

  if (background !== "transparent") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  const intrinsicWidth = (() => {
    const datasetWidth = Number.parseFloat(src.dataset?.intrinsicWidth ?? "");
    if (Number.isFinite(datasetWidth) && datasetWidth > 0) return datasetWidth;
    if (src.naturalWidth > 0) return src.naturalWidth;
    if (src.width > 0) return src.width;
    return 1;
  })();

  const intrinsicHeight = (() => {
    const datasetHeight = Number.parseFloat(src.dataset?.intrinsicHeight ?? "");
    if (Number.isFinite(datasetHeight) && datasetHeight > 0) return datasetHeight;
    if (src.naturalHeight > 0) return src.naturalHeight;
    if (src.height > 0) return src.height;
    return 1;
  })();

  const inner = Math.max(1, Math.round(size * (1 - padPct * 2)));
  const ratio = Math.min(inner / intrinsicWidth, inner / intrinsicHeight);
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : inner / Math.max(intrinsicWidth, intrinsicHeight, 1);
  const w = Math.max(1, Math.round(intrinsicWidth * safeRatio));
  const h = Math.max(1, Math.round(intrinsicHeight * safeRatio));
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

