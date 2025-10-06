export type RegexFlag = "g" | "i" | "m" | "s" | "u" | "y";

export type TestResult = {
  fullMatch: string;
  index: number;
  groups: Array<string | undefined>;
};

export type RegexError = {
  message: string;
};

export function buildRegExp(pattern: string, flags: string): RegExp | RegexError {
  try {
    return new RegExp(pattern, sanitizeFlags(flags));
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Invalid regular expression" };
  }
}

export function testRegex(pattern: string, flags: string, input: string, limit = 2000): { results: TestResult[]; error?: RegexError } {
  const regex = buildRegExp(pattern, flags);
  if (!isRegExp(regex)) {
    return { results: [], error: regex };
  }

  if (!pattern) {
    return { results: [] };
  }

  const results: TestResult[] = [];
  const global = regex.global;

  if (!global) {
    const match = regex.exec(input);
    if (match) {
      results.push({ fullMatch: match[0], index: match.index, groups: Array.from(match).slice(1) });
    }
  } else {
    let count = 0;
    let match: RegExpExecArray | null = regex.exec(input);
    while (match && count < limit) {
      results.push({ fullMatch: match[0], index: match.index, groups: Array.from(match).slice(1) });
      if (match[0] === "") {
        regex.lastIndex += 1;
      }
      count += 1;
      match = regex.exec(input);
    }
  }

  return { results };
}

export function replaceRegex(pattern: string, flags: string, input: string, replacement: string): { output: string; error?: RegexError } {
  const regex = buildRegExp(pattern, flags);
  if (!isRegExp(regex)) {
    return { output: input, error: regex };
  }

  try {
    const output = input.replace(regex, replacement);
    return { output };
  } catch (error) {
    return { output: input, error: { message: error instanceof Error ? error.message : "Replace failed" } };
  }
}

export function sanitizeFlags(flags: string): string {
  const unique = new Set<RegexFlag>();
  for (const flag of flags.split("")) {
    if (!isRegexFlag(flag)) continue;
    unique.add(flag);
  }
  return Array.from(unique).join("");
}

function isRegexFlag(flag: string): flag is RegexFlag {
  return ["g", "i", "m", "s", "u", "y"].includes(flag);
}

function isRegExp(value: RegExp | RegexError): value is RegExp {
  return value instanceof RegExp;
}

