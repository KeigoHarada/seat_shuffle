import React, { useMemo, useState } from "react";
import Popover from "../ui/Popover";
import { useStore } from "../../stores/appStore";

interface SeatAssignPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  targetSeatId: string | null;
  x: number;
  y: number;
}

const SeatAssignPopover: React.FC<SeatAssignPopoverProps> = ({
  isOpen,
  onClose,
  targetSeatId,
  x,
  y,
}) => {
  const students = useStore((state) => state.students);
  const seats = useStore((state) => state.seats);
  const updateSeat = useStore((state) => state.updateSeat);

  const [searchQuery, setSearchQuery] = useState("");

  const unassignedStudents = useMemo(() => {
    const assignedStudentIds = new Set(
      seats.filter((s) => s.studentId).map((s) => s.studentId),
    );
    return students.filter((s) => !assignedStudentIds.has(s.id));
  }, [students, seats]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return unassignedStudents;
    const lowerQuery = searchQuery.toLowerCase();
    return unassignedStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        (s.furigana && s.furigana.toLowerCase().includes(lowerQuery)),
    );
  }, [unassignedStudents, searchQuery]);

  const handleAssign = (studentId: string) => {
    if (targetSeatId) {
      useStore.getState().pushUndo();
      updateSeat(targetSeatId, { studentId });
    }
    onClose();
  };

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      x={x}
      y={y}
      title="生徒の割り当て"
    >
      <div
        className="no-drag"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <input
          type="text"
          placeholder="名前で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            width: "100%",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            paddingRight: 4,
          }}
        >
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => handleAssign(student.id)}
                style={{
                  padding: "10px",
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--c-surface)",
                  cursor: "pointer",
                  transition: "background-color 0.1s, border-color 0.1s",
                  boxShadow: "var(--shadow-1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--c-primary)";
                  e.currentTarget.style.backgroundColor =
                    "var(--c-primary-pale)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--c-border)";
                  e.currentTarget.style.backgroundColor = "var(--c-surface)";
                }}
              >
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
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--c-text-main)",
                  }}
                >
                  {student.name}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--c-text-sub)",
                padding: "20px 0",
                fontSize: 13,
              }}
            >
              未配置の生徒がいません
            </div>
          )}
        </div>
      </div>
    </Popover>
  );
};

export default SeatAssignPopover;
