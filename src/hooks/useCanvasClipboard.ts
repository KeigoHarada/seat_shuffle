import { useCallback } from "react";
import type { Seat } from "../types/seat";
import type { CanvasObject } from "../types/canvas";
import { SEAT_COLS, SEAT_ROWS } from "../constants/canvas";
import { findEmptyPos } from "../utils/canvas";
import { useStore } from "../stores/appStore";

let clipboard: { seats: Seat[]; objects: CanvasObject[] } | null = null;

interface UseCanvasClipboardProps {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}

export const useCanvasClipboard = ({
  selectedIds,
  setSelectedIds,
}: UseCanvasClipboardProps) => {
  const seats = useStore((state) => state.seats);
  const objects = useStore((state) => state.objects);
  const addSeat = useStore((state) => state.addSeat);
  const addObject = useStore((state) => state.addObject);
  const pushUndo = useStore((state) => state.pushUndo);

  const handleCopy = useCallback(() => {
    if (selectedIds.length === 0) return;
    const copiedSeats = seats
      .filter((s) => selectedIds.includes(s.id))
      .map((s) => ({ ...s, studentId: null, isLocked: false }));
    const copiedObjects = objects
      .filter((o) => selectedIds.includes(o.id))
      .map((o) => ({ ...o }));

    clipboard = { seats: copiedSeats, objects: copiedObjects };
  }, [selectedIds, seats, objects]);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;
    if (clipboard.seats.length === 0 && clipboard.objects.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    clipboard.seats.forEach((s) => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x + SEAT_COLS);
      maxY = Math.max(maxY, s.y + SEAT_ROWS);
    });

    clipboard.objects.forEach((o) => {
      minX = Math.min(minX, o.x);
      minY = Math.min(minY, o.y);
      maxX = Math.max(maxX, o.x + o.width);
      maxY = Math.max(maxY, o.y + o.height);
    });

    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;

    const { x: newMinX, y: newMinY } = findEmptyPos(
      minX + 2,
      minY + 2,
      groupWidth,
      groupHeight,
      seats,
      objects,
    );

    const dx = newMinX - minX;
    const dy = newMinY - minY;

    pushUndo();

    const newSelectedIds: string[] = [];
    const nextClipboardSeats: Seat[] = [];
    const nextClipboardObjects: CanvasObject[] = [];

    clipboard.seats.forEach((s) => {
      const newId = crypto.randomUUID();
      newSelectedIds.push(newId);
      const newSeat = { ...s, id: newId, x: s.x + dx, y: s.y + dy };
      addSeat(newSeat);
      nextClipboardSeats.push(newSeat);
    });

    clipboard.objects.forEach((o) => {
      const newId = crypto.randomUUID();
      newSelectedIds.push(newId);
      const newObj = { ...o, id: newId, x: o.x + dx, y: o.y + dy };
      addObject(newObj);
      nextClipboardObjects.push(newObj);
    });

    clipboard = {
      seats: nextClipboardSeats,
      objects: nextClipboardObjects,
    };

    setSelectedIds(newSelectedIds);
  }, [addSeat, addObject, setSelectedIds, seats, objects, pushUndo]);

  const handleDuplicate = useCallback(() => {
    handleCopy();
    handlePaste();
  }, [handleCopy, handlePaste]);

  return {
    handleCopy,
    handlePaste,
    handleDuplicate,
  };
};
