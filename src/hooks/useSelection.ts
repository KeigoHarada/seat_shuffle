import { useState, useCallback } from "react";
import { Seat, CanvasObject } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";

export interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const useSelection = (seats: Seat[], objects: CanvasObject[]) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

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
    setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
  }, []);

  const updateSelectionBox = useCallback(
    (x: number, y: number) => {
      setSelectionBox((prev) => {
        if (!prev) return null;
        const newBox = { ...prev, currentX: x, currentY: y };

        const minX = Math.min(newBox.startX, newBox.currentX);
        const maxX = Math.max(newBox.startX, newBox.currentX);
        const minY = Math.min(newBox.startY, newBox.currentY);
        const maxY = Math.max(newBox.startY, newBox.currentY);

        const newSelectedIds = new Set<string>();

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
            newSelectedIds.add(id);
          }
        };

        seats.forEach((s) =>
          checkIntersection(s.x, s.y, SEAT_COLS, SEAT_ROWS, s.id),
        );
        objects.forEach((o) =>
          checkIntersection(o.x, o.y, o.width, o.height, o.id),
        );

        setSelectedIds(Array.from(newSelectedIds));
        return newBox;
      });
    },
    [seats, objects],
  );

  const endSelectionBox = useCallback(() => {
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
