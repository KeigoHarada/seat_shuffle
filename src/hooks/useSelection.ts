import { useState, useCallback, useRef } from "react";
import { Seat, CanvasObject } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";

export interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

function idsInBox(
  box: SelectionBox,
  seats: Seat[],
  objects: CanvasObject[],
): string[] {
  const minX = Math.min(box.startX, box.currentX);
  const maxX = Math.max(box.startX, box.currentX);
  const minY = Math.min(box.startY, box.currentY);
  const maxY = Math.max(box.startY, box.currentY);
  const selected = new Set<string>();

  const checkIntersection = (
    nx: number,
    ny: number,
    nw: number,
    nh: number,
    id: string,
  ) => {
    const px = nx * GRID_SIZE;
    const py = ny * GRID_SIZE;
    const pw = nw * GRID_SIZE;
    const ph = nh * GRID_SIZE;
    if (px < maxX && px + pw > minX && py < maxY && py + ph > minY) {
      selected.add(id);
    }
  };

  seats.forEach((s) => checkIntersection(s.x, s.y, SEAT_COLS, SEAT_ROWS, s.id));
  objects.forEach((o) => checkIntersection(o.x, o.y, o.width, o.height, o.id));
  return Array.from(selected);
}

export const useSelection = (seats: Seat[], objects: CanvasObject[]) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const selectionBoxRef = useRef<SelectionBox | null>(null);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const selectOnly = useCallback((id: string) => {
    setSelectedIds([id]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const startSelectionBox = useCallback((x: number, y: number) => {
    const next = { startX: x, startY: y, currentX: x, currentY: y };
    selectionBoxRef.current = next;
    setSelectionBox(next);
  }, []);

  const updateSelectionBox = useCallback(
    (x: number, y: number) => {
      const prev = selectionBoxRef.current;
      if (!prev) return;
      const newBox = { ...prev, currentX: x, currentY: y };
      selectionBoxRef.current = newBox;
      setSelectedIds(idsInBox(newBox, seats, objects));
      setSelectionBox(newBox);
    },
    [seats, objects],
  );

  const endSelectionBox = useCallback(() => {
    selectionBoxRef.current = null;
    setSelectionBox(null);
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    selectionBox,
    toggleSelection,
    selectOnly,
    clearSelection,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
  };
};
