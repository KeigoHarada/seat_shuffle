import React, { useState } from "react";
import { useStore } from "../stores";
import SeatNode from "./SeatNode";

const GRID_W = 120;
const GRID_H = 80;

const Canvas: React.FC = () => {
  const seats = useStore((state) => state.seats);
  const addSeat = useStore((state) => state.addSeat);
  const updateSeat = useStore((state) => state.updateSeat);

  const [draggingSeatId, setDraggingSeatId] = useState<string | null>(null);

  const gridStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: "var(--c-bg-main)",
    backgroundImage: `
      linear-gradient(to right, var(--c-surface-disabled) 1px, transparent 1px),
      linear-gradient(to bottom, var(--c-surface-disabled) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_W}px ${GRID_H}px`,
    position: "relative",
    overflow: "auto",
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / GRID_W);
      const y = Math.floor((e.clientY - rect.top) / GRID_H);

      const newSeat = {
        id: crypto.randomUUID(),
        studentId: null,
        groupIds: [],
        x,
        y,
        isLocked: false,
      };
      addSeat(newSeat);
    }
  };

  const handleDragStart = (id: string, e: React.DragEvent) => {
    setDraggingSeatId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingSeatId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_W);
    const y = Math.floor((e.clientY - rect.top) / GRID_H);

    const collision = seats.find(
      (s) => s.x === x && s.y === y && s.id !== draggingSeatId,
    );
    if (!collision) {
      updateSeat(draggingSeatId, { x, y });
    }

    setDraggingSeatId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      style={gridStyle}
      onDoubleClick={handleDoubleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {seats.map((seat) => (
        <SeatNode
          key={seat.id}
          seat={seat}
          gridW={GRID_W}
          gridH={GRID_H}
          onDragStart={(e) => handleDragStart(seat.id, e)}
        />
      ))}
    </div>
  );
};

export default Canvas;
