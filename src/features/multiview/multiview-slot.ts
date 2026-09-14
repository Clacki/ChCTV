export function getMultiviewSlotLabel(index: number): string {
  return index === 0 ? "Main" : `Sub ${index}`;
}
