export function centsFromAmount(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Money amount must be finite.");
  }
  return Math.round(value * 100);
}

export function amountFromCents(cents: number): number {
  return cents / 100;
}

export function splitCentsEvenly(totalCents: number, count: number): number[] {
  if (count <= 0) {
    throw new Error("At least one participant is required.");
  }

  const base = Math.trunc(totalCents / count);
  const remainder = totalCents - base * count;

  return Array.from({ length: count }, (_, index) =>
    base + (index < remainder ? 1 : 0)
  );
}

export function allocateProportionally(totalCents: number, weights: number[]): number[] {
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  if (totalCents === 0 || weightSum === 0) {
    return weights.map(() => 0);
  }

  const raw = weights.map((weight) => (totalCents * weight) / weightSum);
  const floors = raw.map(Math.floor);
  let remaining = totalCents - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (const entry of order) {
    if (remaining <= 0) break;
    floors[entry.index] += 1;
    remaining -= 1;
  }

  return floors;
}
