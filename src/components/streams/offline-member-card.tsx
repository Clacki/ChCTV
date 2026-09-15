import { Avatar } from "@/components/ui/avatar";
import type { Participant } from "@/types/participant";

type OfflineMemberCardProps = {
  participant: Participant;
  channelImageUrl: string | null;
  showRpName?: boolean;
};

/** A read-only roster item for participants without a current LIVE broadcast. */
export function OfflineMemberCard({ participant, channelImageUrl, showRpName = false }: OfflineMemberCardProps) {
  return (
    <article aria-label={`${participant.streamerName} 오프라인`} className="flex h-14 min-w-0 items-center gap-3 rounded-lg border bg-muted/50 px-3">
      <Avatar src={channelImageUrl} alt={`${participant.streamerName} 채널 이미지`} fallback={participant.streamerName} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground/85" title={participant.streamerName}>{participant.streamerName}</p>
        <p className="truncate text-xs text-muted-foreground" title={showRpName && participant.rpName ? participant.rpName : undefined}>
          {showRpName && participant.rpName ? participant.rpName : "OFFLINE"}
        </p>
      </div>
    </article>
  );
}
