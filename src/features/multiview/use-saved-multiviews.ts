"use client";

import { useCallback, useEffect, useState } from "react";

import { mockSavedMultiviews, type MockSavedMultiview } from "@/data/mock-multiviews";

const savedMultiviewsStorageKey = "chctv.saved-multiviews";

function isSavedMultiview(value: unknown): value is MockSavedMultiview {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<MockSavedMultiview>;
  return typeof candidate.id === "string"
    && typeof candidate.name === "string"
    && Array.isArray(candidate.streamIds)
    && candidate.streamIds.every((streamId) => typeof streamId === "string");
}

export function useSavedMultiviews() {
  const [savedMultiviews, setSavedMultiviews] = useState<readonly MockSavedMultiview[]>(mockSavedMultiviews);
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      const storedValue = window.localStorage.getItem(savedMultiviewsStorageKey);

      if (storedValue) {
        try {
          const parsedValue: unknown = JSON.parse(storedValue);
          if (Array.isArray(parsedValue) && parsedValue.every(isSavedMultiview)) {
            setSavedMultiviews(parsedValue);
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

  const saveMultiview = useCallback((name: string, streamIds: readonly string[]) => {
    const trimmedName = name.trim();

    if (!trimmedName || streamIds.length === 0) return "invalid" as const;
    if (savedMultiviews.some((saved) => saved.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
      return "duplicate" as const;
    }

    setSavedMultiviews((multiviews) => [
      ...multiviews,
      { id: `saved-${Date.now()}`, name: trimmedName, streamIds: [...streamIds] },
    ]);
    return "saved" as const;
  }, [savedMultiviews]);

  const removeMultiview = useCallback((id: string) => {
    setSavedMultiviews((multiviews) => multiviews.filter((multiview) => multiview.id !== id));
  }, []);

  return { savedMultiviews, saveMultiview, removeMultiview };
}
