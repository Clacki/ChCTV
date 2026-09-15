import type { MultiviewLayoutPreset } from "@/features/multiview/multiview-layout";

const SLOT_WIDTH_UNITS = 16;
const SLOT_HEIGHT_UNITS = 9;

type ViewerGeometryInput = {
  preset: MultiviewLayoutPreset;
  channelCount: number;
  width: number;
  height: number;
  gap: number;
  columnWeights: readonly number[];
  rowWeights: readonly number[];
};

export type ViewerGeometry = {
  width: number;
  height: number;
};

export function getViewerGeometry({
  width,
  height,
  gap,
  columnWeights,
  rowWeights,
}: ViewerGeometryInput): ViewerGeometry {
  const columnCount = columnWeights.length;
  const rowCount = rowWeights.length;
  const availableWidth = Math.max(width - gap * (columnCount - 1), 0);
  const availableHeight = Math.max(height - gap * (rowCount - 1), 0);
  const widthUnits = columnWeights.reduce((total, weight) => total + weight, 0) * SLOT_WIDTH_UNITS;
  const heightUnits = rowWeights.reduce((total, weight) => total + weight, 0) * SLOT_HEIGHT_UNITS;
  const scale = Math.min(availableWidth / widthUnits, availableHeight / heightUnits);

  return {
    width: Math.max(widthUnits * scale + gap * (columnCount - 1), 0),
    height: Math.max(heightUnits * scale + gap * (rowCount - 1), 0),
  };
}
