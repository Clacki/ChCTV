"use client";

import { useDraggable } from "@dnd-kit/core";
import { LoaderCircle, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { StreamCard, StreamCardSkeleton } from "@/components/streams/stream-card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FacetFilter } from "@/components/ui/facet-filter";
import { matchesParticipantFilters } from "@/lib/participants";
import { cn } from "@/lib/utils";
import type { Participant, ParticipantFilters } from "@/types/participant";
import type { StreamCardData } from "@/types/stream-card";

const affiliationLabelMap: Record<string, string> = {
  "봉누도경찰청": "경찰",
  병원: "EMS",
  "봉누도방송국": "방송국",
  "교통정비공사": "교통정비",
};

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, "ko-KR"));
}

type DiscoveryBrowserProps = {
  streams: readonly StreamCardData[];
  participants: readonly Participant[];
  selection: readonly string[];
  selectionLimit: number;
  onAddStream: (streamId: string) => void;
  isLoading?: boolean;
};

const streamGridClassName = "mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] items-start gap-4";
const loadingSkeletonCount = 8;

export function DiscoveryBrowser({
  streams,
  participants,
  selection,
  selectionLimit,
  onAddStream,
  isLoading = false,
}: DiscoveryBrowserProps) {
  const [query, setQuery] = useState("");
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const participantsByStreamer = useMemo(
    () => new Map(participants.map((participant) => [participant.streamerName, participant])),
    [participants],
  );
  const affiliationOptions = useMemo(
    () => uniqueSorted(participants.flatMap((participant) => participant.affiliations.map((affiliation) => affiliation.name))),
    [participants],
  );
  const groupOptions = useMemo(() => uniqueSorted(participants.flatMap((participant) => participant.groups)), [participants]);
  const tagOptions = useMemo(() => uniqueSorted(participants.flatMap((participant) => participant.tags)), [participants]);
  const hasFilters = affiliations.length > 0 || groups.length > 0 || tags.length > 0;

  const visibleStreams = useMemo(() => {
    const normalizedQuery = normalize(query);
    const filters: ParticipantFilters = { affiliations, groups, tags };

    const filteredStreams = streams
      .filter((stream) => {
        const participant = participantsByStreamer.get(stream.streamerName);
        const searchValues = [stream.streamerName, stream.rpName, ...stream.aliases, ...(participant?.aliases ?? [])];
        const matchesQuery = !normalizedQuery || searchValues.some((value) => value !== null && normalize(value).includes(normalizedQuery));
        const matchesFilters = !hasFilters || (participant !== undefined && matchesParticipantFilters(participant, filters));

        return matchesQuery && matchesFilters;
      });

    return [...filteredStreams].sort((left, right) => right.viewerCount - left.viewerCount);
  }, [affiliations, groups, hasFilters, participantsByStreamer, query, streams, tags]);

  const reset = () => {
    setQuery("");
    setAffiliations([]);
    setGroups([]);
    setTags([]);
  };

  return (
    <>
      <div className="mt-6 flex min-w-0 items-center gap-2">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border bg-background px-3 focus-within:border-border-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
          <Search aria-hidden="true" className="size-4 shrink-0 text-tertiary" />
          <span className="sr-only">방송 검색</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="스트리머명 또는 RP명 검색..."
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
        <FacetFilter label="소속" options={affiliationOptions} selectedValues={affiliations} onChange={setAffiliations} labelForOption={(value) => affiliationLabelMap[value] ?? value} />
        {groupOptions.length > 0 && <FacetFilter label="그룹" options={groupOptions} selectedValues={groups} onChange={setGroups} />}
        {tagOptions.length > 0 && <FacetFilter label="태그" options={tagOptions} selectedValues={tags} onChange={setTags} />}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {affiliations.map((value) => (
          <Chip key={value} selected removable onClick={() => setAffiliations((values) => values.filter((item) => item !== value))}>
            {affiliationLabelMap[value] ?? value}
          </Chip>
        ))}
        {groups.map((value) => (
          <Chip key={value} selected removable onClick={() => setGroups((values) => values.filter((item) => item !== value))}>
            {value}
          </Chip>
        ))}
        {tags.map((value) => (
          <Chip key={value} selected removable onClick={() => setTags((values) => values.filter((item) => item !== value))}>
            {value}
          </Chip>
        ))}
        <p className="ml-auto text-sm font-medium">{isLoading ? "방송 정보를 불러오는 중" : `방송 ${visibleStreams.length}개`}</p>
        {(query || hasFilters) && <Button type="button" variant="ghost" size="sm" onClick={reset}>초기화</Button>}
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
      ) : visibleStreams.length > 0 ? (
        <ul className={streamGridClassName}>
          {visibleStreams.map((stream) => (
            <li key={stream.id} className="min-w-0">
              <DraggableDiscoveryStream
                stream={stream}
                selected={selection.includes(stream.id)}
                canAdd={selection.length < selectionLimit}
                onAdd={() => onAddStream(stream.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm font-medium">조건에 맞는 방송이 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">검색어나 필터를 변경해 보세요.</p>
        </div>
      )}
    </>
  );
}

function DraggableDiscoveryStream({
  stream,
  selected,
  canAdd,
  onAdd,
}: Readonly<{
  stream: StreamCardData;
  selected: boolean;
  canAdd: boolean;
  onAdd: () => void;
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
      />
    </div>
  );
}
