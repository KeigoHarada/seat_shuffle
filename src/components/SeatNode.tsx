import React from "react";
import { useStore } from "../stores";
import { Seat } from "../types";

interface Props {
  seat: Seat;
  gridW: number;
  gridH: number;
  onDragStart: (e: React.DragEvent) => void;
}

const SeatNode: React.FC<Props> = ({ seat, gridW, gridH, onDragStart }) => {
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
    left: seat.x * gridW + 10,
    top: seat.y * gridH + 10,
    width: gridW - 20,
    height: gridH - 20,
    backgroundColor: mainGroup ? mainGroup.color : "var(--c-surface)",
    border: mainGroup ? "none" : "1px solid var(--c-border)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "grab",
    padding: "4px 8px",
    boxSizing: "border-box",
  };

  return (
    <div
      style={style}
      draggable
      onDragStart={onDragStart}
      onContextMenu={(e) => {
        e.preventDefault();
        if (window.confirm("座席を削除しますか？")) {
          removeSeat(seat.id);
        }
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
