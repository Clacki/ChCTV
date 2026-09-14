export function getMultiviewSlotLabel(index: number): string {
  return index === 0 ? "Main" : `Sub ${index}`;
}

export const multiviewSlotKeys = ["main", "sub1", "sub2", "sub3", "sub4", "sub5"] as const;

export type MultiviewSlotKey = (typeof multiviewSlotKeys)[number];
export type MultiviewSubSlotKey = Exclude<MultiviewSlotKey, "main">;
export type MultiviewSlots = Record<MultiviewSlotKey, string | null>;

export function createMultiviewSlots(channelIds: readonly string[]): MultiviewSlots {
  return Object.fromEntries(
    multiviewSlotKeys.map((slotKey, index) => [slotKey, channelIds[index] ?? null]),
  ) as MultiviewSlots;
}

export function swapMainWithSub(slots: MultiviewSlots, subSlot: MultiviewSubSlotKey): MultiviewSlots {
  if (!slots.main || !slots[subSlot]) {
    return slots;
  }

  return { ...slots, main: slots[subSlot], [subSlot]: slots.main };
}

export function getMultiviewSlotLabelByKey(slotKey: MultiviewSlotKey): string {
  return slotKey === "main" ? "Main" : `Sub ${slotKey.slice(3)}`;
}

export function getMultiviewSlotGridArea(slotKey: MultiviewSlotKey): string {
  return slotKey;
}
