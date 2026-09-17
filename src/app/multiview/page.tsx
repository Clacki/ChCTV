import { getValidMultiviewChannelIds } from "@/features/multiview/channel-id";
import { MultiviewEmptyState } from "@/features/multiview/multiview-empty-state";
import { MultiviewWorkspace } from "@/features/multiview/multiview-workspace";

type MultiviewPageProps = {
  searchParams: Promise<{ channel?: string | string[] }>;
};

export default async function MultiviewPage({ searchParams }: MultiviewPageProps) {
  const { channel } = await searchParams;
  const channelIds = getValidMultiviewChannelIds(Array.isArray(channel) ? channel : channel ? [channel] : []);

  if (channelIds.length > 0) {
    return <MultiviewWorkspace channelIds={channelIds} />;
  }

  return <MultiviewEmptyState />;
}
