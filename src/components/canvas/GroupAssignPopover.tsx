import React, { useMemo } from "react";
import Popover from "../ui/Popover";
import Checkbox from "../ui/Checkbox";
import { useStore } from "../../stores";

interface GroupAssignPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  targetSeatIds: string[];
  x: number;
  y: number;
}

const GroupAssignPopover: React.FC<GroupAssignPopoverProps> = ({
  isOpen,
  onClose,
  targetSeatIds,
  x,
  y,
}) => {
  const groups = useStore((state) => state.groups);
  const seats = useStore((state) => state.seats);
  const updateSeat = useStore((state) => state.updateSeat);

  const selectedSeats = useMemo(() => {
    return seats.filter((s) => targetSeatIds.includes(s.id));
  }, [seats, targetSeatIds]);

  const toggleGroup = (groupId: string) => {
    // If all selected seats have the group, remove it from all.
    // Otherwise, add it to all.
    const allHaveIt =
      selectedSeats.length > 0 &&
      selectedSeats.every((s) => s.groupIds.includes(groupId));

    selectedSeats.forEach((seat) => {
      let newGroupIds = [...seat.groupIds];
      if (allHaveIt) {
        newGroupIds = newGroupIds.filter((id) => id !== groupId);
      } else {
        if (!newGroupIds.includes(groupId)) {
          newGroupIds.push(groupId);
        }
      }
      updateSeat(seat.id, { groupIds: newGroupIds });
    });
  };

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      x={x}
      y={y}
      title="グループの選択"
    >
      <div
        className="no-drag"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {groups.length > 0 ? (
          groups.map((group) => {
            const allHaveIt =
              selectedSeats.length > 0 &&
              selectedSeats.every((s) => s.groupIds.includes(group.id));
            const someHaveIt =
              !allHaveIt &&
              selectedSeats.some((s) => s.groupIds.includes(group.id));

            return (
              <div
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
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
                <Checkbox
                  checked={allHaveIt || someHaveIt}
                  indeterminate={someHaveIt}
                  readOnly
                  style={{
                    cursor: "pointer",
                  }}
                />
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: group.color,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--c-text-main)",
                  }}
                >
                  {group.name}
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              textAlign: "center",
              color: "var(--c-text-sub)",
              padding: "20px 0",
              fontSize: 13,
            }}
          >
            グループが登録されていません
          </div>
        )}
      </div>
    </Popover>
  );
};

export default GroupAssignPopover;
