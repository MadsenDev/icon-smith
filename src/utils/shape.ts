export type ShapeVariant = "blob" | "wave" | "zigzag" | "arch" | "grid" | "star" | "petal";

export function generateShapePath(
  variant: ShapeVariant,
  {
    complexity,
    amplitude,
    seed,
  }: {
    complexity: number;
    amplitude: number;
    seed: number;
  },
  width: number,
  height: number,
): string {
  const random = seededRandom(seed);
  switch (variant) {
    case "blob":
      return blobPath({ complexity, amplitude, random, width, height });
    case "wave":
      return wavePath({ complexity, amplitude, width, height });
    case "zigzag":
      return zigzagPath({ complexity, amplitude, width, height });
    case "arch":
      return archPath({ complexity, amplitude, width, height });
    case "grid":
      return gridPath({ complexity, amplitude, width, height });
    case "star":
      return starPath({ complexity, amplitude, width, height });
    case "petal":
      return petalPath({ complexity, amplitude, width, height, random });
    default:
      return blobPath({ complexity, amplitude, random, width, height });
  }
}

type RandomFn = () => number;

function blobPath({ complexity, amplitude, width, height, random }: { complexity: number; amplitude: number; width: number; height: number; random: RandomFn }): string {
  const radius = Math.min(width, height) / 2;
  const centerX = width / 2;
  const centerY = height / 2;
  const points = Math.max(3, Math.round(complexity));
  const step = (Math.PI * 2) / points;
  const path: string[] = [];
  for (let i = 0; i < points; i += 1) {
    const angle = i * step;
    const wobble = 1 + (random() - 0.5) * amplitude * 0.6;
    const x = centerX + Math.cos(angle) * radius * wobble;
    const y = centerY + Math.sin(angle) * radius * wobble;
    if (i === 0) {
      path.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
    } else {
      path.push(`C ${
        (centerX + Math.cos(angle - step / 2) * radius * wobble).toFixed(2)
      } ${
        (centerY + Math.sin(angle - step / 2) * radius * wobble).toFixed(2)
      } ${
        (centerX + Math.cos(angle - step / 2) * radius * wobble).toFixed(2)
      } ${
        (centerY + Math.sin(angle - step / 2) * radius * wobble).toFixed(2)
      } ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
  }
  path.push("Z");
  return path.join(" ");
}

function wavePath({ complexity, amplitude, width, height }: { complexity: number; amplitude: number; width: number; height: number }): string {
  const waves = Math.max(1, Math.round(complexity));
  const amp = amplitude * height * 0.4;
  const path: string[] = [`M 0 ${height / 2}`];
  const segment = width / waves;
  for (let i = 0; i < waves; i += 1) {
    const startX = segment * i;
    const endX = startX + segment;
    const controlY1 = height / 2 - amp;
    const controlY2 = height / 2 + amp;
    path.push(`C ${(startX + segment / 3).toFixed(2)} ${controlY1.toFixed(2)} ${(startX + (segment * 2) / 3).toFixed(2)} ${controlY2.toFixed(2)} ${endX.toFixed(2)} ${(height / 2).toFixed(2)}`);
  }
  path.push(`L ${width} ${height}`);
  path.push(`L 0 ${height}`);
  path.push("Z");
  return path.join(" ");
}

function zigzagPath({ complexity, amplitude, width, height }: { complexity: number; amplitude: number; width: number; height: number }): string {
  const zigs = Math.max(2, Math.round(complexity * 2));
  const amp = amplitude * height * 0.45;
  const step = width / zigs;
  const path: string[] = [`M 0 ${(height / 2).toFixed(2)}`];
  for (let i = 1; i <= zigs; i += 1) {
    const x = step * i;
    const y = i % 2 === 0 ? height / 2 + amp : height / 2 - amp;
    path.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  path.push(`L ${width} ${height}`);
  path.push(`L 0 ${height}`);
  path.push("Z");
  return path.join(" ");
}

function archPath({ complexity, amplitude, width, height }: { complexity: number; amplitude: number; width: number; height: number }): string {
  const arches = Math.max(1, Math.round(complexity));
  const radius = width / (arches * 2);
  const amp = amplitude * height * 0.4;
  const path: string[] = ["M 0 " + height.toFixed(2)];
  for (let i = 0; i < arches; i += 1) {
    const startX = i * (radius * 2);
    const midX = startX + radius;
    const endX = startX + radius * 2;
    path.push(`Q ${midX.toFixed(2)} ${(height - amp).toFixed(2)} ${endX.toFixed(2)} ${height.toFixed(2)}`);
  }
  path.push(`L ${width.toFixed(2)} 0`);
  path.push("L 0 0 Z");
  return path.join(" ");
}

function gridPath({ complexity, amplitude, width, height }: { complexity: number; amplitude: number; width: number; height: number }): string {
  const cols = Math.max(2, Math.round(complexity * 2));
  const rows = Math.max(2, Math.round(complexity * 1.5));
  const inset = amplitude * Math.min(width, height) * 0.15;
  const cellWidth = (width - inset * 2) / cols;
  const cellHeight = (height - inset * 2) / rows;
  const radius = Math.min(cellWidth, cellHeight) * 0.15;
  const path: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = inset + col * cellWidth;
      const y = inset + row * cellHeight;
      path.push(rectWithRadius(x, y, cellWidth, cellHeight, radius));
    }
  }
  return path.join(" ");
}

function starPath({ complexity, amplitude, width, height }: { complexity: number; amplitude: number; width: number; height: number }): string {
  const points = Math.max(5, Math.round(complexity * 5));
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius * (0.5 + amplitude * 0.3);
  const centerX = width / 2;
  const centerY = height / 2;
  const step = Math.PI / points;
  const path: string[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    path.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  path.push("Z");
  return path.join(" ");
}

function petalPath({ complexity, amplitude, width, height, random }: { complexity: number; amplitude: number; width: number; height: number; random: RandomFn }): string {
  const petals = Math.max(4, Math.round(complexity * 6));
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2;
  const petalWidth = maxRadius * (0.3 + amplitude * 0.3);
  const path: string[] = [];
  for (let i = 0; i < petals; i += 1) {
    const angle = (Math.PI * 2 * i) / petals;
    const radius = maxRadius * (0.7 + random() * amplitude * 0.4);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const ctrlAngle1 = angle - Math.PI / petals;
    const ctrlAngle2 = angle + Math.PI / petals;
    path.push(
      `M ${centerX.toFixed(2)} ${centerY.toFixed(2)} C ${(centerX + Math.cos(ctrlAngle1) * petalWidth).toFixed(2)} ${(centerY + Math.sin(ctrlAngle1) * petalWidth).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} ${(centerX + Math.cos(ctrlAngle2) * petalWidth).toFixed(2)} ${(centerY + Math.sin(ctrlAngle2) * petalWidth).toFixed(2)} Z`,
    );
  }
  return path.join(" ");
}

function rectWithRadius(x: number, y: number, width: number, height: number, radius: number): string {
  return `M ${(x + radius).toFixed(2)} ${y.toFixed(2)} H ${(x + width - radius).toFixed(2)} Q ${(x + width).toFixed(2)} ${y.toFixed(2)} ${(x + width).toFixed(2)} ${(y + radius).toFixed(2)} V ${(y + height - radius).toFixed(2)} Q ${(x + width).toFixed(2)} ${(y + height).toFixed(2)} ${(x + width - radius).toFixed(2)} ${(y + height).toFixed(2)} H ${(x + radius).toFixed(2)} Q ${x.toFixed(2)} ${(y + height).toFixed(2)} ${x.toFixed(2)} ${(y + height - radius).toFixed(2)} V ${(y + radius).toFixed(2)} Q ${x.toFixed(2)} ${y.toFixed(2)} ${(x + radius).toFixed(2)} ${y.toFixed(2)} Z`;
}

function seededRandom(seed: number): RandomFn {
  let value = Math.abs(seed) % 2147483647;
  if (value === 0) value = 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

