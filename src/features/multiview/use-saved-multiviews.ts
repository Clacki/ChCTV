"use client";

import { useCallback, useEffect, useState } from "react";

import { getNextDefaultMultiviewName, type SavedMultiview } from "@/features/multiview/saved-multiview";

export const savedMultiviewsStorageKey = "chctv.saved-multiviews";

function isSavedMultiview(value: unknown): value is SavedMultiview {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<SavedMultiview>;
  return typeof candidate.id === "string"
    && typeof candidate.name === "string"
    && Array.isArray(candidate.channelIds)
    && candidate.channelIds.every((channelId) => typeof channelId === "string");
}

function migrateSavedMultiview(value: unknown): SavedMultiview | null {
  if (isSavedMultiview(value)) return value;
  if (typeof value !== "object" || value === null) return null;

  const candidate = value as { id?: unknown; name?: unknown; streamIds?: unknown };
  if (typeof candidate.id !== "string" || typeof candidate.name !== "string" || !Array.isArray(candidate.streamIds)) {
    return null;
  }

  const channelIds = candidate.streamIds
    .filter((streamId): streamId is string => typeof streamId === "string" && streamId.startsWith("channel:"))
    .map((streamId) => streamId.slice("channel:".length));

  return channelIds.length === candidate.streamIds.length ? { id: candidate.id, name: candidate.name, channelIds } : null;
}

export function useSavedMultiviews() {
  const [savedMultiviews, setSavedMultiviews] = useState<readonly SavedMultiview[]>([]);
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      const storedValue = window.localStorage.getItem(savedMultiviewsStorageKey);

      if (storedValue) {
        try {
          const parsedValue: unknown = JSON.parse(storedValue);
          if (Array.isArray(parsedValue)) {
            const migratedMultiviews = parsedValue.map(migrateSavedMultiview);
            if (migratedMultiviews.every((multiview): multiview is SavedMultiview => multiview !== null)) {
              setSavedMultiviews(migratedMultiviews);
            }
          }
        } catch {
          // Ignore malformed local data and keep the initial mock list.
        }
      }
      setHasRestored(true);
    });

    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  useEffect(() => {
    if (hasRestored) {
      window.localStorage.setItem(savedMultiviewsStorageKey, JSON.stringify(savedMultiviews));
    }
  }, [hasRestored, savedMultiviews]);

  const saveMultiview = useCallback((name: string, channelIds: readonly string[]) => {
    const trimmedName = name.trim();
    const savedName = trimmedName || getNextDefaultMultiviewName(savedMultiviews);

    if (channelIds.length === 0) return "invalid" as const;
    if (trimmedName && savedMultiviews.some((saved) => saved.name.trim().toLocaleLowerCase("ko-KR") === savedName.toLocaleLowerCase("ko-KR"))) {
      return "duplicate" as const;
    }

    setSavedMultiviews((multiviews) => [
      ...multiviews,
      { id: `saved-${Date.now()}`, name: savedName, channelIds: [...channelIds] },
    ]);
    return "saved" as const;
  }, [savedMultiviews]);

  const removeMultiview = useCallback((id: string) => {
    setSavedMultiviews((multiviews) => multiviews.filter((multiview) => multiview.id !== id));
  }, []);

  return { savedMultiviews, saveMultiview, removeMultiview };
}
