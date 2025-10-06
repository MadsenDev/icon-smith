import { useMemo } from "react";
import { computeLineDiff, formatJson, isJsonLike, summarizeDiff } from "../utils/diff";

export function useDiff(base: string, target: string, options?: { autoFormatJson?: boolean }) {
  return useMemo(() => {
    let baseValue = base ?? "";
    let targetValue = target ?? "";

    if (options?.autoFormatJson) {
      if (isJsonLike(baseValue)) {
        baseValue = formatJson(baseValue);
      }
      if (isJsonLike(targetValue)) {
        targetValue = formatJson(targetValue);
      }
    }

    const diff = computeLineDiff(baseValue, targetValue);
    const summary = summarizeDiff(diff);

    return {
      base: baseValue,
      target: targetValue,
      diff,
      summary,
    };
  }, [base, target, options?.autoFormatJson]);
}

