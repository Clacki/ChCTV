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

export function removeMultiviewSlotChannel(slots: MultiviewSlots, channelId: string): MultiviewSlots {
  return createMultiviewSlots(
    multiviewSlotKeys.flatMap((slotKey) => {
      const currentChannelId = slots[slotKey];
      return currentChannelId && currentChannelId !== channelId ? [currentChannelId] : [];
    }),
  );
}

export function getMultiviewChannelIds(slots: MultiviewSlots): string[] {
  return multiviewSlotKeys.flatMap((slotKey) => slots[slotKey] ? [slots[slotKey]] : []);
}

export function getMultiviewSlotKeyByChannelId(
  slots: MultiviewSlots,
  channelId: string,
): MultiviewSlotKey | null {
  return multiviewSlotKeys.find((slotKey) => slots[slotKey] === channelId) ?? null;
}

export function getMultiviewSlotLabelByKey(slotKey: MultiviewSlotKey): string {
  return slotKey === "main" ? "Main" : `Sub ${slotKey.slice(3)}`;
}

export function getMultiviewSlotGridArea(slotKey: MultiviewSlotKey): string {
  return slotKey;
}
