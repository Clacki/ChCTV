export type MultiviewLayoutPreset = "focus-right" | "focus-bottom" | "balanced";

type MultiviewGridLayout = {
  columns: string;
  rows: string;
  areas: string;
  columnWeights: readonly number[];
  rowWeights: readonly number[];
};

const balancedLayouts: Record<number, MultiviewGridLayout> = {
  1: { columns: "minmax(0, 1fr)", rows: "minmax(0, 1fr)", areas: '"main"', columnWeights: [1], rowWeights: [1] },
  2: { columns: "repeat(2, minmax(0, 1fr))", rows: "minmax(0, 1fr)", areas: '"main sub1"', columnWeights: [1, 1], rowWeights: [1] },
  3: { columns: "repeat(2, minmax(0, 1fr))", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1" "sub2 ."', columnWeights: [1, 1], rowWeights: [1, 1] },
  4: { columns: "repeat(2, minmax(0, 1fr))", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1" "sub2 sub3"', columnWeights: [1, 1], rowWeights: [1, 1] },
  5: { columns: "repeat(3, minmax(0, 1fr))", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1 sub2" "sub3 sub4 ."', columnWeights: [1, 1, 1], rowWeights: [1, 1] },
  6: { columns: "repeat(3, minmax(0, 1fr))", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1 sub2" "sub3 sub4 sub5"', columnWeights: [1, 1, 1], rowWeights: [1, 1] },
};

const focusRightLayouts: Record<number, MultiviewGridLayout> = {
  1: balancedLayouts[1],
  2: { columns: "minmax(0, 1fr) minmax(0, 1fr)", rows: "minmax(0, 1fr)", areas: '"main sub1"', columnWeights: [1, 1], rowWeights: [1] },
  3: { columns: "minmax(0, 2fr) minmax(0, 1fr)", rows: "repeat(2, minmax(0, 1fr))", areas: '"main sub1" "main sub2"', columnWeights: [2, 1], rowWeights: [1, 1] },
  4: { columns: "minmax(0, 3fr) minmax(0, 1fr)", rows: "repeat(3, minmax(0, 1fr))", areas: '"main sub1" "main sub2" "main sub3"', columnWeights: [3, 1], rowWeights: [1, 1, 1] },
  5: { columns: "minmax(0, 4fr) minmax(0, 1fr)", rows: "repeat(4, minmax(0, 1fr))", areas: '"main sub1" "main sub2" "main sub3" "main sub4"', columnWeights: [4, 1], rowWeights: [1, 1, 1, 1] },
  6: { columns: "minmax(0, 5fr) minmax(0, 1fr)", rows: "repeat(5, minmax(0, 1fr))", areas: '"main sub1" "main sub2" "main sub3" "main sub4" "main sub5"', columnWeights: [5, 1], rowWeights: [1, 1, 1, 1, 1] },
};

const focusBottomLayouts: Record<number, MultiviewGridLayout> = {
  1: balancedLayouts[1],
  2: { columns: "minmax(0, 1fr)", rows: "minmax(0, 1fr) minmax(0, 1fr)", areas: '"main" "sub1"', columnWeights: [1], rowWeights: [1, 1] },
  3: { columns: "repeat(2, minmax(0, 1fr))", rows: "minmax(0, 2fr) minmax(0, 1fr)", areas: '"main main" "sub1 sub2"', columnWeights: [1, 1], rowWeights: [2, 1] },
  4: { columns: "repeat(3, minmax(0, 1fr))", rows: "minmax(0, 3fr) minmax(0, 1fr)", areas: '"main main main" "sub1 sub2 sub3"', columnWeights: [1, 1, 1], rowWeights: [3, 1] },
  5: { columns: "repeat(4, minmax(0, 1fr))", rows: "minmax(0, 4fr) minmax(0, 1fr)", areas: '"main main main main" "sub1 sub2 sub3 sub4"', columnWeights: [1, 1, 1, 1], rowWeights: [4, 1] },
  6: { columns: "repeat(5, minmax(0, 1fr))", rows: "minmax(0, 5fr) minmax(0, 1fr)", areas: '"main main main main main" "sub1 sub2 sub3 sub4 sub5"', columnWeights: [1, 1, 1, 1, 1], rowWeights: [5, 1] },
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
