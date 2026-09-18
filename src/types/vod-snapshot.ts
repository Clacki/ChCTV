import type { ParticipantVodFailure } from "@/server/chzzk/participant-vods";
import type { Vod } from "./vod";

export type VodSnapshot = {
  version: 1;
  refreshedAt: number;
  vods: Vod[];
  failures: ParticipantVodFailure[];
  startedAt: number;
  completedAt: number;
};
