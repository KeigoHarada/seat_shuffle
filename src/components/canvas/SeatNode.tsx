import React, { useEffect, useRef, useState, useMemo } from "react";
import { Lock } from "lucide-react";
import { useStore } from "../../stores/appStore";
import { useUiStore } from "../../stores/uiStore";
import { AVAILABLE_ICONS, type IconName } from "../../constants/icons";
import type { Seat } from "../../types/seat";
import type { Role } from "../../types/student";
import type { Group } from "../../types/group";
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

const StudentRolesBadge: React.FC<{ roles: Role[] }> = ({ roles }) => {
  if (roles.length === 0) return null;
  return (
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
      {roles.slice(0, 3).map((role) => {
        const IconComp =
          AVAILABLE_ICONS[role.iconName as IconName] || AVAILABLE_ICONS.Star;
        return (
          <div key={role.id} title={role.name} style={{ display: "flex" }}>
            <IconComp size={14} />
          </div>
        );
      })}
      {roles.length > 3 && (
        <span style={{ fontSize: 10, lineHeight: 1 }}>...</span>
      )}
    </div>
  );
};

const SeatGroupsBadge: React.FC<{ groups: Group[] }> = ({ groups }) => {
  if (groups.length === 0) return null;
  return (
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
      {groups.slice(0, 3).map((group) => (
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
      {groups.length > 3 && (
        <span
          style={{ fontSize: 10, color: "var(--c-text-sub)", lineHeight: 1 }}
        >
          ...
        </span>
      )}
    </div>
  );
};

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
  const editingStudentId = useUiStore((state) => state.editingStudentId);
  const isViewMode = useUiStore((state) => state.isViewMode);

  const student = students.find((s) => s.id === seat.studentId);
  const seatGroups = useMemo(
    () => groups.filter((g) => seat.groupIds.includes(g.id)),
    [groups, seat.groupIds],
  );
  const mainGroup = seatGroups.length > 0 ? seatGroups[0] : null;

  const studentRoles = useMemo(
    () =>
      student ? allRoles.filter((r) => student.roleIds?.includes(r.id)) : [],
    [student, allRoles],
  );

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

  const isEditing =
    seat.studentId !== null && editingStudentId === seat.studentId;

  const backgroundColor = useMemo(() => {
    if (isViewMode || !mainGroup) return "var(--c-surface)";
    return `color-mix(in srgb, ${mainGroup.color} 30%, white)`;
  }, [isViewMode, mainGroup]);

  const style: React.CSSProperties = {
    position: "absolute",
    left: seat.x * GRID_SIZE + 4,
    top: seat.y * GRID_SIZE + 4,
    width: SEAT_COLS * GRID_SIZE - 8,
    height: SEAT_ROWS * GRID_SIZE - 8,
    backgroundColor,
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
          {!isViewMode && <StudentRolesBadge roles={studentRoles} />}
        </>
      ) : (
        <div style={{ fontSize: 14, color: "var(--c-text-sub)" }}>空席</div>
      )}

      {!isViewMode && <SeatGroupsBadge groups={seatGroups} />}

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
