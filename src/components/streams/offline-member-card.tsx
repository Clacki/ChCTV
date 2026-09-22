import { Avatar } from "@/components/ui/avatar";
import type { NameDisplayMode } from "@/components/streams/stream-card";
import type { Participant } from "@/types/participant";

type OfflineMemberCardProps = {
  participant: Participant;
  channelImageUrl: string | null;
  nameDisplayMode?: NameDisplayMode;
};

/** A read-only roster item for participants without a current LIVE broadcast. */
export function OfflineMemberCard({ participant, channelImageUrl, nameDisplayMode = "both" }: OfflineMemberCardProps) {
  const displayedName = nameDisplayMode === "rp" ? participant.rpName ?? participant.streamerName : participant.streamerName;
  const showsRpName = nameDisplayMode === "both" && participant.rpName !== null;

  return (
    <article aria-label={`${participant.streamerName} 오프라인`} className="flex h-14 min-w-0 items-center gap-3 rounded-lg border bg-muted/50 px-3">
      <Avatar src={channelImageUrl} alt={`${participant.streamerName} 채널 이미지`} fallback={participant.streamerName} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground/85" title={displayedName}>{displayedName}</p>
        <p className="truncate text-xs text-muted-foreground" title={showsRpName ? participant.rpName ?? undefined : undefined}>
          {showsRpName ? participant.rpName : "OFFLINE"}
        </p>
      </div>
    </article>
  );
}
