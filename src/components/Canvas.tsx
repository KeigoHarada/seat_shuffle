import React, { useState } from "react";
import { useStore } from "../stores";
import SeatNode from "./SeatNode";
import { Seat } from "../types";

export const GRID_SIZE = 20;
export const SEAT_COLS = 6;
export const SEAT_ROWS = 4;

const emptyImage = new Image();
if (typeof window !== "undefined") {
  emptyImage.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
}

const isColliding = (x1: number, y1: number, x2: number, y2: number) => {
  return (
    x1 < x2 + SEAT_COLS &&
    x1 + SEAT_COLS > x2 &&
    y1 < y2 + SEAT_ROWS &&
    y1 + SEAT_ROWS > y2
  );
};

const Canvas: React.FC = () => {
  const seats = useStore((state) => state.seats);
  const addSeat = useStore((state) => state.addSeat);
  const updateSeat = useStore((state) => state.updateSeat);

  const [dragState, setDragState] = useState<{
    id: string;
    visualX: number;
    visualY: number;
    validX: number;
    validY: number;
    isSwapMode: boolean;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const gridStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: "var(--c-bg-main)",
    backgroundImage: `
      linear-gradient(to right, var(--c-surface-disabled) 1px, transparent 1px),
      linear-gradient(to bottom, var(--c-surface-disabled) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
    position: "relative",
    overflow: "auto",
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
      const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);

      const collision = seats.find((s) => isColliding(x, y, s.x, s.y));
      if (!collision) {
        const newSeat: Seat = {
          id: crypto.randomUUID(),
          studentId: null,
          groupIds: [],
          x,
          y,
          isLocked: false,
        };
        addSeat(newSeat);
      }
    }
  };

  const handleDragStart = (id: string, e: React.DragEvent) => {
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const isSwapMode = e.ctrlKey || e.metaKey;
    if (isSwapMode) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "move";
    }

    if (dragState) {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropX = e.clientX - rect.left - dragOffset.x;
      const dropY = e.clientY - rect.top - dragOffset.y;

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
  };

  const handleDrop = (e: React.DragEvent) => {
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
        updateSeat(draggingSeat.id, { studentId: targetSeatForSwap.studentId });
        updateSeat(targetSeatForSwap.id, { studentId: draggingSeat.studentId });
      }
    } else {
      updateSeat(dragState.id, { x: dragState.validX, y: dragState.validY });
    }

    setDragState(null);
  };

  const handleDragEnd = () => {
    setDragState(null);
  };

  return (
    <div
      style={gridStyle}
      onDoubleClick={handleDoubleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {seats.map((seat) => {
        const isDragging = dragState?.id === seat.id;
        let displaySeat = seat;
        let isSwapTarget = false;

        if (isDragging && dragState) {
          const renderX = dragState.isSwapMode
            ? dragState.visualX
            : dragState.validX;
          const renderY = dragState.isSwapMode
            ? dragState.visualY
            : dragState.validY;
          displaySeat = { ...seat, x: renderX, y: renderY };
        } else if (dragState?.isSwapMode) {
          const cx = Math.floor(dragState.visualX + SEAT_COLS / 2);
          const cy = Math.floor(dragState.visualY + SEAT_ROWS / 2);
          if (
            cx >= seat.x &&
            cx < seat.x + SEAT_COLS &&
            cy >= seat.y &&
            cy < seat.y + SEAT_ROWS
          ) {
            isSwapTarget = true;
          }
        }

        return (
          <SeatNode
            key={seat.id}
            seat={displaySeat}
            isDragging={isDragging}
            isSwapTarget={isSwapTarget}
            onDragStart={(e) => handleDragStart(seat.id, e)}
            onDragEnd={handleDragEnd}
          />
        );
      })}
    </div>
  );
};

export default Canvas;
