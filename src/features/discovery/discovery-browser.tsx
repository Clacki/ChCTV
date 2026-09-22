"use client";

import { useDraggable } from "@dnd-kit/core";
import { ChevronDown, Flame, LoaderCircle, Search, X } from "lucide-react";
import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";

import { OfflineMemberCard } from "@/components/streams/offline-member-card";
import { StreamCard, StreamCardSkeleton, type NameDisplayMode } from "@/components/streams/stream-card";
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
  risingHistoryReady?: boolean;
  risingEnabled?: boolean;
  onRetry?: () => void;
};

const streamGridClassName = "mt-3 grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] items-start gap-3";
const loadingSkeletonCount = 8;
export const discoveryNameDisplayModeStorageKey = "chctv.discovery.name-display-mode";

const nameDisplayLabels: Record<NameDisplayMode, string> = {
  both: "스트리머 + RP",
  streamer: "스트리머명",
  rp: "RP명",
};

function isNameDisplayMode(value: string | null): value is NameDisplayMode {
  return value === "both" || value === "streamer" || value === "rp";
}

function isRisingCandidate(stream: StreamCardData) {
  return stream.isRising === true
    && stream.risingIncrease !== null
    && stream.risingIncrease !== undefined
    && stream.risingIncrease > 30;
}

export function DiscoveryBrowser({
  members,
  selection,
  selectionLimit,
  onAddStream,
  isLoading = false,
  hasError = false,
  risingHistoryReady = false,
  risingEnabled = true,
  onRetry,
}: DiscoveryBrowserProps) {
  const [query, setQuery] = useState("");
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [risingOnly, setRisingOnly] = useState(false);
  const [previousRisingEnabled, setPreviousRisingEnabled] = useState(risingEnabled);
  const [nameDisplayMode, setNameDisplayMode] = useState<NameDisplayMode>("both");
  const [hasRestoredNameDisplayMode, setHasRestoredNameDisplayMode] = useState(false);

  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      const storedNameDisplayMode = window.localStorage.getItem(discoveryNameDisplayModeStorageKey);
      setNameDisplayMode(isNameDisplayMode(storedNameDisplayMode) ? storedNameDisplayMode : "both");
      setHasRestoredNameDisplayMode(true);
    });

    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  useEffect(() => {
    if (hasRestoredNameDisplayMode) {
      window.localStorage.setItem(discoveryNameDisplayModeStorageKey, nameDisplayMode);
    }
  }, [hasRestoredNameDisplayMode, nameDisplayMode]);

  if (risingEnabled !== previousRisingEnabled) {
    setPreviousRisingEnabled(risingEnabled);
    if (!risingEnabled) {
      setRisingOnly(false);
    }
  }

  const catalogParticipants = useMemo(() => getParticipants(), []);
  const affiliationOptions = useMemo(
    () => uniqueSorted(catalogParticipants.flatMap((participant) => participant.affiliations.map((affiliation) => affiliation.name))),
    [catalogParticipants],
  );
  const affiliationSections = useMemo(
    () => [
      { label: "공공기관", type: "public" },
      { label: "사업체", type: "business" },
      { label: "갱단", type: "gang" },
    ].map(({ label, type }) => ({
      label,
      values: uniqueSorted(catalogParticipants.flatMap((participant) =>
        participant.affiliations.filter((affiliation) => affiliation.type === type).map((affiliation) => affiliation.name),
      )),
    })).filter((section) => section.values.length > 0),
    [catalogParticipants],
  );
  const groupOptions = useMemo(
    () => uniqueSorted([...GROUP_FILTER_VALUES, ...catalogParticipants.flatMap((participant) => participant.groups)]),
    [catalogParticipants],
  );
  const risingCandidates = useMemo(
    () => members.flatMap((member) => member.status === "LIVE" && isRisingCandidate(member.stream) ? [member.stream] : []),
    [members],
  );
  const hasActiveFilter = Boolean(normalize(query)) || affiliations.length > 0 || groups.length > 0 || risingOnly;

  const filteredMembers = useMemo(() => {
    const normalizedQuery = normalize(query);
    const filters: ParticipantFilters = { affiliations, groups };

    return members.filter((member) => {
      const { participant } = member;
      const searchValues = [participant.streamerName, participant.rpName, ...participant.aliases];
      const matchesQuery = !normalizedQuery || searchValues.some((value) => value !== null && normalize(value).includes(normalizedQuery));
      const matchesFilters = matchesParticipantFilters(participant, filters);

      return matchesQuery
        && matchesFilters
        && (!risingOnly || (member.status === "LIVE" && isRisingCandidate(member.stream)));
    });
  }, [affiliations, groups, members, query, risingOnly]);

  const visibleStreams = useMemo(
    () => filteredMembers.flatMap((member) => member.status === "LIVE" ? [member.stream] : []).sort((left, right) => risingOnly ? (right.risingSortValue ?? 0) - (left.risingSortValue ?? 0) : right.viewerCount - left.viewerCount),
    [filteredMembers, risingOnly],
  );
  const offlineMembers = useMemo(
    () => hasActiveFilter ? filteredMembers.flatMap((member) => member.status === "OFFLINE" ? [member] : []) : [],
    [filteredMembers, hasActiveFilter],
  );

  const reset = () => {
    setQuery("");
    setAffiliations([]);
    setGroups([]);
    setRisingOnly(false);
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
        <FacetFilter
          label="봉누도 소속"
          options={affiliationOptions}
          sections={affiliationSections}
          selectedValues={affiliations}
          onChange={setAffiliations}
          collapsibleSections
          searchPlaceholder="조직명 검색"
          onClear={() => setAffiliations([])}
        />
        <RisingFilter
          enabled={risingEnabled}
          selected={risingOnly}
          onClick={() => setRisingOnly((value) => !value)}
        />
        <NameDisplayFilter value={nameDisplayMode} onChange={setNameDisplayMode} />
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
                    onAddStream={onAddStream}
                    nameDisplayMode={nameDisplayMode}
                    showRisingIncrease={risingOnly && isRisingCandidate(stream)}
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
                    <OfflineMemberCard participant={member.participant} channelImageUrl={member.channelImageUrl} nameDisplayMode={nameDisplayMode} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {visibleStreams.length === 0 && offlineMembers.length === 0 && risingOnly && !risingHistoryReady && (
            <div className="mt-4 rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm font-medium">시선 집중 데이터를 확인하고 있습니다.</p>
              <p className="mt-1 text-sm text-muted-foreground">방송의 시청자 변화가 쌓이면 자동으로 표시됩니다.</p>
            </div>
          )}
          {visibleStreams.length === 0 && offlineMembers.length === 0 && risingOnly && risingHistoryReady && risingCandidates.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm font-medium">아직 시선이 집중된 방송이 없습니다.</p>
              <p className="mt-1 text-sm text-muted-foreground">시청자가 빠르게 늘어나는 방송이 감지되면 표시됩니다.</p>
            </div>
          )}
          {visibleStreams.length === 0 && offlineMembers.length === 0 && (!risingOnly || (risingHistoryReady && risingCandidates.length > 0)) && (
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

function NameDisplayFilter({ value, onChange }: Readonly<{
  value: NameDisplayMode;
  onChange: (value: NameDisplayMode) => void;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border bg-card px-2.5 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span>{nameDisplayLabels[value]}</span>
        <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-150", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div id={menuId} role="menu" aria-label="이름 표시 방식" className="absolute right-0 z-20 mt-2 w-44 rounded-md border bg-card p-1 shadow-lg">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">이름 표시 방식</p>
          {(Object.keys(nameDisplayLabels) as NameDisplayMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              role="menuitemradio"
              aria-checked={value === mode}
              onClick={() => {
                onChange(mode);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
                value === mode ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
              )}
            >
              <span className={cn("flex size-4 items-center justify-center rounded-full border", value === mode ? "border-primary" : "border-border-strong")}>
                {value === mode && <span className="size-2 rounded-full bg-primary" />}
              </span>
              {nameDisplayLabels[mode]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RisingFilter({ enabled, selected, onClick }: Readonly<{
  enabled: boolean;
  selected: boolean;
  onClick: () => void;
}>) {
  const tooltipId = useId();

  if (enabled) {
    return (
      <Chip selected={selected} className="h-9 rounded-md" onClick={onClick}>
        <Flame aria-hidden="true" className="size-3.5" />
        시선 집중
      </Chip>
    );
  }

  return (
    <span className="group/rising relative inline-flex shrink-0" tabIndex={0} aria-describedby={tooltipId}>
      <Chip disabled className="h-9 rounded-md">
        <Flame aria-hidden="true" className="size-3.5" />
        시선 집중
      </Chip>
      <span
        id={tooltipId}
        role="tooltip"
        className="invisible absolute left-1/2 top-full z-20 mt-1 w-max -translate-x-1/2 group-hover/rising:visible group-focus-visible/rising:visible"
      >
        <span className="block rounded border border-border bg-background px-2 py-1 text-xs text-foreground shadow-sm">
          운영시간에 사용할 수 있습니다.
        </span>
      </span>
    </span>
  );
}

const DraggableDiscoveryStream = memo(function DraggableDiscoveryStream({
  stream,
  selected,
  canAdd,
  onAddStream,
  nameDisplayMode,
  showRisingIncrease,
}: Readonly<{
  stream: StreamCardData;
  selected: boolean;
  canAdd: boolean;
  onAddStream: (streamId: string) => void;
  nameDisplayMode: NameDisplayMode;
  showRisingIncrease: boolean;
}>) {
  const handleAdd = useCallback(() => onAddStream(stream.id), [onAddStream, stream.id]);
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
        onAdd={handleAdd}
        addDisabled={!canInteract}
        draggable={canInteract}
        nameDisplayMode={nameDisplayMode}
        showRisingIncrease={showRisingIncrease}
      />
    </div>
  );
});
