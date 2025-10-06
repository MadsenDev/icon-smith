export type DiffLine = {
  type: "added" | "removed" | "unchanged";
  value: string;
  indexA: number | null;
  indexB: number | null;
};

export type DiffSummary = {
  additions: number;
  deletions: number;
  unchanged: number;
};

export function computeLineDiff(a: string, b: string): DiffLine[] {
  const aLines = splitLines(a);
  const bLines = splitLines(b);

  const rows = aLines.length;
  const cols = bLines.length;

  const lcs: number[][] = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0));

  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      if (aLines[i] === bLines[j]) {
        lcs[i][j] = lcs[i + 1][j + 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i + 1][j], lcs[i][j + 1]);
      }
    }
  }

  const diff: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < rows && j < cols) {
    if (aLines[i] === bLines[j]) {
      diff.push({ type: "unchanged", value: aLines[i], indexA: i, indexB: j });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      diff.push({ type: "removed", value: aLines[i], indexA: i, indexB: null });
      i += 1;
    } else {
      diff.push({ type: "added", value: bLines[j], indexA: null, indexB: j });
      j += 1;
    }
  }

  while (i < rows) {
    diff.push({ type: "removed", value: aLines[i], indexA: i, indexB: null });
    i += 1;
  }

  while (j < cols) {
    diff.push({ type: "added", value: bLines[j], indexA: null, indexB: j });
    j += 1;
  }

  return diff;
}

export function summarizeDiff(diff: DiffLine[]): DiffSummary {
  return diff.reduce<DiffSummary>(
    (summary, line) => {
      if (line.type === "added") {
        summary.additions += 1;
      } else if (line.type === "removed") {
        summary.deletions += 1;
      } else {
        summary.unchanged += 1;
      }
      return summary;
    },
    { additions: 0, deletions: 0, unchanged: 0 },
  );
}

export function isJsonLike(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return false;
  try {
    JSON.parse(trimmed);
    return true;
  } catch (error) {
    return false;
  }
}

export function formatJson(value: string, indent = 2): string {
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, indent);
  } catch (error) {
    return value;
  }
}

function splitLines(input: string): string[] {
  if (!input) return [];
  return input.replace(/\r\n/g, "\n").split("\n");
}

