import React, { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { useStore } from "../../stores/appStore";
import { AVAILABLE_ICONS, type IconName } from "../../constants/icons";
import { Seat } from "../../types/seat";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../../constants/canvas";

interface Props {
  seat: Seat;
  isDragging?: boolean;
  isSwapTarget?: boolean;
  isSelected?: boolean;
  isGhost?: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onPointerCancel?: (e: React.PointerEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

const SeatNode: React.FC<Props> = ({
  seat,
  isDragging,
  isSwapTarget,
  isSelected,
  isGhost,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onDoubleClick,
}) => {
  const students = useStore((state) => state.students);
  const groups = useStore((state) => state.groups);
  const allRoles = useStore((state) => state.roles);
  const editingStudentId = useStore((state) => state.editingStudentId);
  const isViewMode = useStore((state) => state.isViewMode);

  const student = students.find((s) => s.id === seat.studentId);
  const seatGroups = groups.filter((g) => seat.groupIds.includes(g.id));
  const mainGroup = seatGroups.length > 0 ? seatGroups[0] : null;

  const studentRoles = student
    ? allRoles.filter((r) => student.roleIds?.includes(r.id))
    : [];

  const prevStudentId = useRef(seat.studentId);
  const [isSwapped, setIsSwapped] = useState(false);

  useEffect(() => {
    if (prevStudentId.current !== seat.studentId) {
      setIsSwapped(true);
      const timer = setTimeout(() => setIsSwapped(false), 300);
      prevStudentId.current = seat.studentId;
      return () => clearTimeout(timer);
    }
  }, [seat.studentId]);

  const getBackgroundColor = () => {
    if (isViewMode || !mainGroup) return "var(--c-surface)";
    const c = mainGroup.color;
    return `color-mix(in srgb, ${c} 30%, white)`;
  };

  const isEditing =
    seat.studentId !== null && editingStudentId === seat.studentId;

  const style: React.CSSProperties = {
    position: "absolute",
    left: seat.x * GRID_SIZE + 4,
    top: seat.y * GRID_SIZE + 4,
    width: SEAT_COLS * GRID_SIZE - 8,
    height: SEAT_ROWS * GRID_SIZE - 8,
    backgroundColor: getBackgroundColor(),
    border: isSelected
      ? "2px solid var(--c-primary)"
      : "1px solid var(--c-border)",
    borderRadius: "var(--radius-md)",
    boxShadow: isDragging
      ? "var(--shadow-3)"
      : isSwapTarget || isEditing
        ? "0 0 0 3px var(--c-primary), var(--shadow-2)"
        : "var(--shadow-1)",
    transform: isSwapped
      ? "scale(1.05)"
      : isSwapTarget || isEditing
        ? "scale(1.02)"
        : "none",
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging
      ? 15
      : isSelected
        ? 12
        : isSwapTarget || isEditing
          ? 11
          : 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: isDragging ? "grabbing" : "grab",
    padding: "4px 8px",
    boxSizing: "border-box",
    userSelect: "none",
    transition: isDragging ? "none" : "all 0.1s ease",
    pointerEvents: isGhost ? "none" : "auto",
    touchAction: "none",
  };

  return (
    <div
      className="seat-node-item"
      data-x={seat.x}
      data-y={seat.y}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => {
        if (onPointerUp) onPointerUp(e);
      }}
      onPointerCancel={(e) => {
        if (onPointerCancel) onPointerCancel(e);
        else if (onPointerUp) onPointerUp(e);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onDoubleClick) onDoubleClick(e);
      }}
      title="長押しまたは右クリックでメニュー / ドラッグで移動"
    >
      {student ? (
        <>
          <div
            style={{
              position: "absolute",
              top: 4,
              left: 6,
              fontSize: 12,
              fontWeight: 700,
              color: "var(--c-text-sub)",
              lineHeight: 1,
            }}
          >
            {student.attendanceNumber}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--c-text-sub)",
              lineHeight: 1,
              marginBottom: 2,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {student.furigana || " "}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "var(--c-text-main)",
              lineHeight: 1.2,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {student.name}
          </div>
          {studentRoles.length > 0 && !isViewMode && (
            <div
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                display: "flex",
                gap: 2,
                color: "var(--c-text-sub)",
                alignItems: "center",
              }}
            >
              {studentRoles.slice(0, 3).map((role) => {
                const IconComp =
                  AVAILABLE_ICONS[role.iconName as IconName] ||
                  AVAILABLE_ICONS.Star;
                return (
                  <div
                    key={role.id}
                    title={role.name}
                    style={{ display: "flex" }}
                  >
                    <IconComp size={14} />
                  </div>
                );
              })}
              {studentRoles.length > 3 && (
                <span style={{ fontSize: 10, lineHeight: 1 }}>...</span>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 14, color: "var(--c-text-sub)" }}>空席</div>
      )}

      {seatGroups.length > 0 && !isViewMode && (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          {seatGroups.slice(0, 3).map((group) => (
            <div
              key={group.id}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: group.color,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
              title={group.name}
            />
          ))}
          {seatGroups.length > 3 && (
            <span
              style={{
                fontSize: 10,
                color: "var(--c-text-sub)",
                lineHeight: 1,
              }}
            >
              ...
            </span>
          )}
        </div>
      )}

      {seat.isLocked && !isViewMode && (
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 4,
            color: "var(--c-text-sub)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Lock size={12} />
        </div>
      )}
    </div>
  );
};

export default SeatNode;
