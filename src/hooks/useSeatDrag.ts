import { useState, useCallback } from "react";
import { Seat } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";

const emptyImage = new Image();
if (typeof window !== "undefined") {
  emptyImage.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
}

export const isColliding = (x1: number, y1: number, x2: number, y2: number) => {
  return (
    x1 < x2 + SEAT_COLS &&
    x1 + SEAT_COLS > x2 &&
    y1 < y2 + SEAT_ROWS &&
    y1 + SEAT_ROWS > y2
  );
};

export const useSeatDrag = (
  seats: Seat[],
  updateSeat: (id: string, data: Partial<Seat>) => void,
  pan: { x: number; y: number },
  scale: number,
  viewportRef: React.RefObject<HTMLDivElement | null>,
) => {
  const [dragState, setDragState] = useState<{
    id: string;
    visualX: number;
    visualY: number;
    validX: number;
    validY: number;
    isSwapMode: boolean;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = useCallback(
    (id: string, e: React.DragEvent) => {
      const seat = seats.find((s) => s.id === id);
      if (!seat) return;

      setDragState({
        id,
        visualX: seat.x,
        visualY: seat.y,
        validX: seat.x,
        validY: seat.y,
        isSwapMode: false,
      });

      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setDragImage(emptyImage, 0, 0);

      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [seats],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const isSwapMode = e.ctrlKey || e.metaKey;
      e.dataTransfer.dropEffect = isSwapMode ? "copy" : "move";

      if (dragState && viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        const dropX = (e.clientX - rect.left - pan.x - dragOffset.x) / scale;
        const dropY = (e.clientY - rect.top - pan.y - dragOffset.y) / scale;

        const newX = Math.max(0, Math.round(dropX / GRID_SIZE));
        const newY = Math.max(0, Math.round(dropY / GRID_SIZE));

        const collision = seats.find(
          (s) => isColliding(newX, newY, s.x, s.y) && s.id !== dragState.id,
        );

        const nextValidX = collision ? dragState.validX : newX;
        const nextValidY = collision ? dragState.validY : newY;

        if (
          newX !== dragState.visualX ||
          newY !== dragState.visualY ||
          nextValidX !== dragState.validX ||
          nextValidY !== dragState.validY ||
          isSwapMode !== dragState.isSwapMode
        ) {
          setDragState({
            ...dragState,
            visualX: newX,
            visualY: newY,
            validX: nextValidX,
            validY: nextValidY,
            isSwapMode,
          });
        }
      }
    },
    [dragState, dragOffset, pan, scale, seats, viewportRef],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragState) return;

      const draggingSeat = seats.find((s) => s.id === dragState.id);
      if (!draggingSeat) {
        setDragState(null);
        return;
      }

      if (dragState.isSwapMode) {
        const cx = Math.floor(dragState.visualX + SEAT_COLS / 2);
        const cy = Math.floor(dragState.visualY + SEAT_ROWS / 2);
        const targetSeatForSwap = seats.find(
          (s) =>
            cx >= s.x &&
            cx < s.x + SEAT_COLS &&
            cy >= s.y &&
            cy < s.y + SEAT_ROWS &&
            s.id !== dragState.id,
        );

        if (
          targetSeatForSwap &&
          !draggingSeat.isLocked &&
          !targetSeatForSwap.isLocked
        ) {
          updateSeat(draggingSeat.id, {
            studentId: targetSeatForSwap.studentId,
          });
          updateSeat(targetSeatForSwap.id, {
            studentId: draggingSeat.studentId,
          });
        }
      } else {
        updateSeat(dragState.id, { x: dragState.validX, y: dragState.validY });
      }

      setDragState(null);
    },
    [dragState, seats, updateSeat],
  );

  const handleDragEnd = useCallback(() => {
    setDragState(null);
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
