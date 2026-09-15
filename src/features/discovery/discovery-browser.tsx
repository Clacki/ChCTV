"use client";

import { useDraggable } from "@dnd-kit/core";
import { LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { OfflineMemberCard } from "@/components/streams/offline-member-card";
import { StreamCard, StreamCardSkeleton } from "@/components/streams/stream-card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FacetFilter } from "@/components/ui/facet-filter";
import type { DiscoveryMember } from "@/features/discovery/participant-broadcast-adapter";
import { GROUP_FILTER_SECTIONS, GROUP_FILTER_VALUES } from "@/features/discovery/discovery-filter-config";
import { getParticipants, matchesParticipantFilters } from "@/lib/participants";
import { cn } from "@/lib/utils";
import type { ParticipantFilters } from "@/types/participant";
import type { StreamCardData } from "@/types/stream-card";

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, "ko-KR"));
}

type DiscoveryBrowserProps = {
  members: readonly DiscoveryMember[];
  selection: readonly string[];
  selectionLimit: number;
  onAddStream: (streamId: string) => void;
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
};

const streamGridClassName = "mt-3 grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] items-start gap-3";
const loadingSkeletonCount = 8;
export const discoveryShowRpNameStorageKey = "chctv.discovery.show-rp-name";

export function DiscoveryBrowser({
  members,
  selection,
  selectionLimit,
  onAddStream,
  isLoading = false,
  hasError = false,
  onRetry,
}: DiscoveryBrowserProps) {
  const [query, setQuery] = useState("");
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [showRpName, setShowRpName] = useState(false);
  const [hasRestoredRpNamePreference, setHasRestoredRpNamePreference] = useState(false);

  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      setShowRpName(window.localStorage.getItem(discoveryShowRpNameStorageKey) === "true");
      setHasRestoredRpNamePreference(true);
    });

    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  useEffect(() => {
    if (hasRestoredRpNamePreference) {
      window.localStorage.setItem(discoveryShowRpNameStorageKey, String(showRpName));
    }
  }, [hasRestoredRpNamePreference, showRpName]);

  const catalogParticipants = useMemo(() => getParticipants(), []);
  const affiliationOptions = useMemo(
    () => uniqueSorted(catalogParticipants.flatMap((participant) => participant.affiliations.map((affiliation) => affiliation.name))),
    [catalogParticipants],
  );
  const groupOptions = useMemo(
    () => uniqueSorted([...GROUP_FILTER_VALUES, ...catalogParticipants.flatMap((participant) => participant.groups)]),
    [catalogParticipants],
  );
  const hasActiveFilter = Boolean(normalize(query)) || affiliations.length > 0 || groups.length > 0;

  const filteredMembers = useMemo(() => {
    const normalizedQuery = normalize(query);
    const filters: ParticipantFilters = { affiliations, groups };

    return members.filter((member) => {
      const { participant } = member;
      const searchValues = [participant.streamerName, participant.rpName, ...participant.aliases];
      const matchesQuery = !normalizedQuery || searchValues.some((value) => value !== null && normalize(value).includes(normalizedQuery));
      const matchesFilters = matchesParticipantFilters(participant, filters);

      return matchesQuery && matchesFilters;
    });
  }, [affiliations, groups, members, query]);

  const visibleStreams = useMemo(
    () => filteredMembers.flatMap((member) => member.status === "LIVE" ? [member.stream] : []).sort((left, right) => right.viewerCount - left.viewerCount),
    [filteredMembers],
  );
  const offlineMembers = useMemo(
    () => hasActiveFilter ? filteredMembers.flatMap((member) => member.status === "OFFLINE" ? [member] : []) : [],
    [filteredMembers, hasActiveFilter],
  );

  const reset = () => {
    setQuery("");
    setAffiliations([]);
    setGroups([]);
  };

  return (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <label className="flex h-9 min-w-56 flex-1 items-center gap-2 rounded-md border bg-background px-3 focus-within:border-border-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
          <Search aria-hidden="true" className="size-4 shrink-0 text-tertiary" />
          <span className="sr-only">방송 검색</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="스트리머명, RP명 또는 별칭 검색..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-tertiary"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex size-6 cursor-pointer items-center justify-center rounded-sm text-tertiary hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="검색어 지우기"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </label>
        <FacetFilter label="그룹" options={groupOptions} sections={GROUP_FILTER_SECTIONS} selectedValues={groups} onChange={setGroups} />
        <FacetFilter label="봉누도 소속" options={affiliationOptions} selectedValues={affiliations} onChange={setAffiliations} />
        <button
          type="button"
          role="switch"
          aria-checked={showRpName}
          onClick={() => setShowRpName((value) => !value)}
          className={cn(
            "inline-flex h-9 shrink-0 cursor-pointer items-center rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            showRpName ? "border-primary bg-primary/10 text-primary" : "bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
          )}
        >
          RP 이름 {showRpName ? "ON" : "OFF"}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {affiliations.map((value) => (
          <Chip key={value} selected removable onClick={() => setAffiliations((values) => values.filter((item) => item !== value))}>
            {value}
          </Chip>
        ))}
        {groups.map((value) => (
          <Chip key={value} selected removable onClick={() => setGroups((values) => values.filter((item) => item !== value))}>
            {value}
          </Chip>
        ))}
        <p className="ml-auto text-xs font-medium text-muted-foreground">{isLoading ? "방송 정보를 불러오는 중" : `방송 ${visibleStreams.length}개`}</p>
        {hasActiveFilter && <Button type="button" variant="ghost" size="sm" onClick={reset}>초기화</Button>}
      </div>

      {isLoading ? (
        <>
          <div role="status" aria-label="방송 정보를 불러오는 중" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-primary motion-reduce:animate-none" />
            <span>방송 정보를 불러오는 중</span>
          </div>
          <ul aria-label="방송 정보 로딩" className={streamGridClassName}>
            {Array.from({ length: loadingSkeletonCount }, (_, index) => (
              <li key={index} className="min-w-0">
                <StreamCardSkeleton />
              </li>
            ))}
          </ul>
        </>
      ) : hasError ? (
        <div className="mt-4 rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm font-medium">방송 정보를 불러오지 못했습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
          {onRetry && <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={onRetry}>다시 시도</Button>}
        </div>
      ) : (
        <>
          {visibleStreams.length > 0 && (
            <ul className={streamGridClassName}>
              {visibleStreams.map((stream) => (
                <li key={stream.id} className="min-w-0">
                  <DraggableDiscoveryStream
                    stream={stream}
                    selected={selection.includes(stream.id)}
                    canAdd={selection.length < selectionLimit}
                    onAdd={() => onAddStream(stream.id)}
                    showRpName={showRpName}
                  />
                </li>
              ))}
            </ul>
          )}
          {offlineMembers.length > 0 && (
            <section aria-labelledby="offline-participants-heading" className="mt-6">
              <h2 id="offline-participants-heading" className="text-sm font-medium text-muted-foreground">오프라인 참가자 {offlineMembers.length}명</h2>
              <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(min(100%,11rem),1fr))] gap-2">
                {offlineMembers.map((member) => (
                  <li key={member.participant.streamerName} className="min-w-0">
                    <OfflineMemberCard participant={member.participant} channelImageUrl={member.channelImageUrl} showRpName={showRpName} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {visibleStreams.length === 0 && offlineMembers.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm font-medium">조건에 맞는 방송이 없습니다.</p>
              <p className="mt-1 text-sm text-muted-foreground">필터 조건을 변경하거나 초기화해 보세요.</p>
              {hasActiveFilter && <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={reset}>필터 초기화</Button>}
            </div>
          )}
        </>
      )}
    </>
  );
}

function DraggableDiscoveryStream({
  stream,
  selected,
  canAdd,
  onAdd,
  showRpName,
}: Readonly<{
  stream: StreamCardData;
  selected: boolean;
  canAdd: boolean;
  onAdd: () => void;
  showRpName: boolean;
}>) {
  const canInteract = !selected && canAdd;
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: `discovery:${stream.id}`,
    data: { type: "discovery-stream", streamId: stream.id },
    disabled: !canInteract,
  });
  const draggableAttributes = {
    ...attributes,
    role: undefined,
    tabIndex: undefined,
    "aria-disabled": undefined,
    "aria-roledescription": undefined,
  };

  return (
    <div
      ref={setNodeRef}
      {...draggableAttributes}
      {...listeners}
      className={cn(
        "min-w-0",
        canInteract && "cursor-grab active:cursor-grabbing",
        isDragging && "cursor-grabbing opacity-60",
      )}
    >
      <StreamCard
        stream={stream}
        selected={selected}
        onAdd={onAdd}
        addDisabled={!canInteract}
        draggable={canInteract}
        showRpName={showRpName}
      />
    </div>
  );
}
