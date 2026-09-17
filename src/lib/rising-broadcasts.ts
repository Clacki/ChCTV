export const RISING_CONFIG = { windowMs: 10 * 60 * 1000, resetMs: 15 * 60 * 1000, minCurrent: 100, minRate: 0.1 } as const;
export type Snapshot = { timestamp: number; viewerCount: number };

export function getRisingIncrease(snapshots: readonly Snapshot[]): number | null {
  if (snapshots.length < 2) return null;
  const previous = snapshots.at(-2)!; const latest = snapshots.at(-1)!;
  const recentIncrease = latest.viewerCount - previous.viewerCount;
  const recentRate = previous.viewerCount === 0 ? 0 : recentIncrease / previous.viewerCount;
  if (latest.viewerCount < RISING_CONFIG.minCurrent || recentIncrease <= 0 || recentRate < RISING_CONFIG.minRate) return null;
  return recentIncrease;
}

export function getRisingSortValue(snapshots: readonly Snapshot[]): number | null {
  if (snapshots.length < 2) return null;
  const first = snapshots.at(-3) ?? snapshots[0];
  const latest = snapshots.at(-1)!;
  return latest.viewerCount - first.viewerCount;
}
