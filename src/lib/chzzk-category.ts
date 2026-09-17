import type { ScheduleStatus } from "./bongnudo-schedule";

export const CHZZK_GTA_CATEGORY_KEY = "Grand_Theft_Auto_V";

export function isChzzkGtaCategory(categoryKey: string | null | undefined): boolean {
  return categoryKey === CHZZK_GTA_CATEGORY_KEY;
}

export function getDefaultGtaFilterEnabled(scheduleStatus: ScheduleStatus): boolean {
  return scheduleStatus === "OPEN";
}
