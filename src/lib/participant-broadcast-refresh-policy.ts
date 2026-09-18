import { getBongnudoScheduleStatus, type ScheduleStatus } from "./bongnudo-schedule";

export const ACTIVE_BROADCAST_REFRESH_SECONDS = 5 * 60;
export const INACTIVE_BROADCAST_REFRESH_SECONDS = 15 * 60;

export type ParticipantBroadcastRefreshPolicy = {
  scheduleStatus: ScheduleStatus;
  intervalSeconds: number;
};

export function isRisingAvailable(scheduleStatus: ScheduleStatus): boolean {
  return scheduleStatus === "PRE_OPEN" || scheduleStatus === "OPEN";
}

export function shouldRecordRisingHistory(now: Date = new Date()): boolean {
  return isRisingAvailable(getParticipantBroadcastRefreshPolicy(now).scheduleStatus);
}

/** Keeps browser polling and server snapshot freshness on the same schedule. */
export function getParticipantBroadcastRefreshPolicy(
  now: Date = new Date(),
): ParticipantBroadcastRefreshPolicy {
  const schedule = getBongnudoScheduleStatus(now);
  const intervalSeconds = isRisingAvailable(schedule.status)
    ? ACTIVE_BROADCAST_REFRESH_SECONDS
    : INACTIVE_BROADCAST_REFRESH_SECONDS;

  return { scheduleStatus: schedule.status, intervalSeconds };
}
