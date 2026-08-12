import React from "react";
import { useStore } from "../stores";
import { Seat } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";

interface Props {
  seat: Seat;
  isDragging?: boolean;
  isSwapTarget?: boolean;
  isSelected?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onPointerDown: (e: React.PointerEvent) => void;
}

const SeatNode: React.FC<Props> = ({
  seat,
  isDragging,
  isSwapTarget,
  isSelected,
  onDragStart,
  onDragEnd,
  onPointerDown,
}) => {
  const students = useStore((state) => state.students);
  const groups = useStore((state) => state.groups);

  const student = students.find((s) => s.id === seat.studentId);
  const mainGroup =
    seat.groupIds.length > 0
      ? groups.find((g) => g.id === seat.groupIds[0])
      : null;

  const style: React.CSSProperties = {
    position: "absolute",
    left: seat.x * GRID_SIZE + 4,
    top: seat.y * GRID_SIZE + 4,
    width: SEAT_COLS * GRID_SIZE - 8,
    height: SEAT_ROWS * GRID_SIZE - 8,
    backgroundColor: mainGroup ? mainGroup.color : "var(--c-surface)",
    border: isSelected
      ? "2px solid var(--c-primary)"
      : mainGroup
        ? "none"
        : "1px solid var(--c-border)",
    borderRadius: "var(--radius-md)",
    boxShadow: isDragging
      ? "var(--shadow-3)"
      : isSwapTarget
        ? "0 0 0 3px var(--c-primary)"
        : isSelected
          ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
          : "var(--shadow-1)",
    transform: isSwapTarget ? "scale(1.02)" : "none",
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : isSelected ? 6 : isSwapTarget ? 5 : 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: isDragging ? "grabbing" : "grab",
    padding: "4px 8px",
    boxSizing: "border-box",
    userSelect: "none",
    transition: isDragging ? "none" : "all 0.1s ease",
  };

  return (
    <div
      style={style}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
      }}
      title="右クリックでメニュー / ドラッグで移動"
    >
      {student ? (
        <>
          <div
            style={{
              fontSize: 10,
              color: "var(--c-text-sub)",
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            {student.furigana || " "}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--c-text-main)",
              lineHeight: 1.2,
            }}
          >
            {student.name}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: "var(--c-text-sub)" }}>空席</div>
      )}
      {seat.isLocked && (
        <div style={{ position: "absolute", top: -5, right: -5, fontSize: 12 }}>
          🔒
        </div>
      )}
    </div>
  );
};

export default SeatNode;
