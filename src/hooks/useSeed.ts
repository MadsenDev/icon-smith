import { useCallback, useMemo, useState } from "react";

export function useSeed(initialSeed?: string) {
  const [seed, setSeedState] = useState<string>(() => initialSeed ?? generateSeed());

  const random = useMemo(() => createRandom(seed), [seed]);

  const setSeed = useCallback((value?: string) => {
    setSeedState(value && value.length > 0 ? value : generateSeed());
  }, []);

  const reseed = useCallback(() => {
    setSeedState(generateSeed());
  }, []);

  return { seed, setSeed, reseed, random };
}

function generateSeed(): string {
  const segment = Math.random().toString(36).slice(2, 8);
  return `seed-${segment}`;
}

function createRandom(seed: string) {
  return mulberry32(stringToSeed(seed));
}

function stringToSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash || 1;
}

function mulberry32(seed: number) {
  let t = seed;
  return function random() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

