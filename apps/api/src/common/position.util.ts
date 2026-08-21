// Gap below which two positions are considered collided and the caller should rebalance.
export const POSITION_REBALANCE_GAP = 1e-6;

/** Fractional rank strictly between two neighbours (either end may be absent). */
export function midpointPosition(before: number | null, after: number | null): number {
  if (before === null && after === null) return 0;
  if (before === null) return after! - 1;
  if (after === null) return before + 1;
  return (before + after) / 2;
}

export function needsRebalance(before: number | null, after: number | null): boolean {
  return before !== null && after !== null && after - before < POSITION_REBALANCE_GAP;
}
