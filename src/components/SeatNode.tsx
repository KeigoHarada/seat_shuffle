import React from "react";
import { useStore } from "../stores";
import { Seat } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "./Canvas";

interface Props {
  seat: Seat;
  isDragging?: boolean;
  isSwapTarget?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const SeatNode: React.FC<Props> = ({
  seat,
  isDragging,
  isSwapTarget,
  onDragStart,
  onDragEnd,
}) => {
  const removeSeat = useStore((state) => state.removeSeat);
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
    border: mainGroup ? "none" : "1px solid var(--c-border)",
    borderRadius: "var(--radius-md)",
    boxShadow: isDragging
      ? "var(--shadow-3)"
      : isSwapTarget
        ? "0 0 0 3px var(--c-primary)"
        : "var(--shadow-1)",
    transform: isSwapTarget ? "scale(1.02)" : "none",
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : isSwapTarget ? 5 : 1,
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
      onContextMenu={(e) => {
        e.preventDefault();
        // TODO: Context menu replace native confirm later
        if (window.confirm("座席を削除しますか？")) {
          removeSeat(seat.id);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
      }}
      title="右クリックで削除 / ドラッグで移動"
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
