import { useCallback } from "react";
import { Seat } from "../types";

interface UseNodeEventsProps {
  seats: Seat[];
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  selectOnly: (id: string) => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  setPopoverPos: (pos: { x: number; y: number }) => void;
  setAssignPopoverSeatId: (id: string | null) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setActiveSettingsTab: (
    tab: "students" | "roles" | "groups" | "constraints" | "global",
  ) => void;
  setHighlightedStudentId: (id: string | null) => void;
}

export const useNodeEvents = ({
  seats,
  selectedIds,
  toggleSelection,
  selectOnly,
  viewportRef,
  setPopoverPos,
  setAssignPopoverSeatId,
  setIsSettingsOpen,
  setActiveSettingsTab,
  setHighlightedStudentId,
}: UseNodeEventsProps) => {
  const handleNodePointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.stopPropagation();
      if (e.ctrlKey || e.metaKey) {
        toggleSelection(id);
      } else if (!selectedIds.includes(id)) {
        selectOnly(id);
      }
    },
    [selectedIds, toggleSelection, selectOnly],
  );

  const handleSeatDoubleClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const seat = seats.find((s) => s.id === id);
      if (seat && !seat.studentId) {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (rect) {
          setPopoverPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
        setAssignPopoverSeatId(id);
      } else if (seat && seat.studentId) {
        setIsSettingsOpen(true);
        setActiveSettingsTab("students");
        setHighlightedStudentId(seat.studentId);
      }
    },
    [
      seats,
      viewportRef,
      setPopoverPos,
      setAssignPopoverSeatId,
      setIsSettingsOpen,
      setActiveSettingsTab,
      setHighlightedStudentId,
    ],
  );

  return {
    handleNodePointerDown,
    handleSeatDoubleClick,
  };
};
