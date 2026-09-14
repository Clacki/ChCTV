"use client";

import { useCallback, useState } from "react";

export const multiviewSelectionLimit = 6;

export function useMultiviewSelection() {
  const [selection, setSelection] = useState<string[]>([]);

  const addStream = useCallback((streamId: string) => {
    setSelection((streams) => (
      streams.includes(streamId) || streams.length >= multiviewSelectionLimit
        ? streams
        : [...streams, streamId]
    ));
  }, []);

  const removeStream = useCallback((streamId: string) => {
    setSelection((streams) => streams.filter((id) => id !== streamId));
  }, []);

  const moveStream = useCallback((streamId: string, overStreamId: string) => {
    setSelection((streams) => {
      const oldIndex = streams.indexOf(streamId);
      const newIndex = streams.indexOf(overStreamId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return streams;
      }

      const nextSelection = [...streams];
      nextSelection.splice(oldIndex, 1);
      nextSelection.splice(newIndex, 0, streamId);
      return nextSelection;
    });
  }, []);

  const moveStreamByOffset = useCallback((streamId: string, offset: number) => {
    setSelection((streams) => {
      const oldIndex = streams.indexOf(streamId);
      const newIndex = oldIndex + offset;

      if (oldIndex === -1 || newIndex < 0 || newIndex >= streams.length) {
        return streams;
      }

      const nextSelection = [...streams];
      nextSelection.splice(oldIndex, 1);
      nextSelection.splice(newIndex, 0, streamId);
      return nextSelection;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection([]);
  }, []);

  const replaceSelection = useCallback((streamIds: readonly string[]) => {
    setSelection([...new Set(streamIds)].slice(0, multiviewSelectionLimit));
  }, []);

  const isSelected = useCallback((streamId: string) => selection.includes(streamId), [selection]);

  return {
    selection,
    addStream,
    removeStream,
    moveStream,
    moveStreamByOffset,
    clearSelection,
    replaceSelection,
    isSelected,
  };
}
