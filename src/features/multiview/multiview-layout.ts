export type MultiviewLayoutPreset = "focus-right" | "focus-bottom" | "balanced";

type MultiviewGridLayout = {
  columns: string;
  rows: string;
  areas: string;
};

const balancedLayouts: Record<number, MultiviewGridLayout> = {
  1: { columns: "minmax(0, 1fr)", rows: "minmax(0, 1fr)", areas: '"main"' },
  2: { columns: "repeat(2, minmax(0, 1fr))", rows: "minmax(0, 1fr)", areas: '"main sub1"' },
  3: { columns: "repeat(2, minmax(0, 1fr))", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1" "sub2 ."' },
  4: { columns: "repeat(2, minmax(0, 1fr))", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1" "sub2 sub3"' },
  5: { columns: "repeat(3, minmax(0, 1fr))", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1 sub2" "sub3 sub4 ."' },
  6: { columns: "repeat(3, minmax(0, 1fr))", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1 sub2" "sub3 sub4 sub5"' },
};

const focusRightLayouts: Record<number, MultiviewGridLayout> = {
  1: balancedLayouts[1],
  2: { columns: "minmax(0, 2fr) minmax(0, 1fr)", rows: "minmax(0, 1fr)", areas: '"main sub1"' },
  3: { columns: "minmax(0, 2fr) minmax(0, 1fr)", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1" "main sub2"' },
  4: { columns: "minmax(0, 2fr) minmax(0, 1fr)", rows: "repeat(3, minmax(0, 1fr))", areas: '"main sub1" "main sub2" "main sub3"' },
  5: { columns: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1 sub2" "main sub3 sub4"' },
  6: { columns: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)", rows: "repeat(3, minmax(0, 1fr))", areas: '"main sub1 sub2" "main sub3 sub4" "main sub5 ."' },
};

const focusBottomLayouts: Record<number, MultiviewGridLayout> = {
  1: balancedLayouts[1],
  2: { columns: "repeat(2, minmax(0, 1fr))", rows: "minmax(0, 2fr) minmax(0, 1fr)", areas: '"main main" "sub1 sub1"' },
  3: { columns: "repeat(2, minmax(0, 1fr))", rows: "minmax(0, 2fr) minmax(0, 1fr)", areas: '"main main" "sub1 sub2"' },
  4: { columns: "repeat(3, minmax(0, 1fr))", rows: "minmax(0, 2fr) minmax(0, 1fr)", areas: '"main main main" "sub1 sub2 sub3"' },
  5: { columns: "repeat(4, minmax(0, 1fr))", rows: "minmax(0, 2fr) minmax(0, 1fr)", areas: '"main main main main" "sub1 sub2 sub3 sub4"' },
  6: { columns: "repeat(3, minmax(0, 1fr))", rows: "minmax(0, 2fr) repeat(2, minmax(0, 1fr))", areas: '"main main main" "sub1 sub2 sub3" "sub4 sub5 ."' },
};

const layoutsByPreset: Record<MultiviewLayoutPreset, Record<number, MultiviewGridLayout>> = {
  "focus-right": focusRightLayouts,
  "focus-bottom": focusBottomLayouts,
  balanced: balancedLayouts,
};

export function getDefaultMultiviewLayoutPreset(channelCount: number): MultiviewLayoutPreset {
  if (channelCount === 2 || channelCount === 5) {
    return "focus-right";
  }

  if (channelCount === 3 || channelCount === 4) {
    return "focus-bottom";
  }

  return "balanced";
}

export function getMultiviewLayout(channelCount: number, preset: MultiviewLayoutPreset): MultiviewGridLayout {
  const count = Math.min(Math.max(channelCount, 1), 6);
  return layoutsByPreset[preset][count];
}
