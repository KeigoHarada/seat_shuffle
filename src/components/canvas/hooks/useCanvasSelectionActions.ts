import { useCallback } from "react";
import { useStore } from "../../../stores/appStore";

interface UseCanvasSelectionActionsProps {
  selectedIds: string[];
  clearSelection: () => void;
  setContextMenu?: (menu: null) => void;
}

export const useCanvasSelectionActions = ({
  selectedIds,
  clearSelection,
  setContextMenu,
}: UseCanvasSelectionActionsProps) => {
  const seats = useStore((state) => state.seats);
  const removeSeat = useStore((state) => state.removeSeat);
  const removeObject = useStore((state) => state.removeObject);
  const updateSeat = useStore((state) => state.updateSeat);
  const pushUndo = useStore((state) => state.pushUndo);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    pushUndo();
    selectedIds.forEach((id) => {
      removeSeat(id);
      removeObject(id);
    });
    clearSelection();
    setContextMenu?.(null);
  }, [selectedIds, removeSeat, removeObject, clearSelection, setContextMenu, pushUndo]);

  const handleUnassignSelected = useCallback(() => {
    const occupiedIds = selectedIds.filter((id) => {
      const seat = seats.find((s) => s.id === id);
      return Boolean(seat?.studentId);
    });
    if (occupiedIds.length === 0) return;
    pushUndo();
    occupiedIds.forEach((id) => {
      updateSeat(id, { studentId: null, isLocked: false });
    });
    clearSelection();
    setContextMenu?.(null);
  }, [selectedIds, seats, updateSeat, clearSelection, setContextMenu, pushUndo]);

  const handleToggleLockSelected = useCallback(
    (locked: boolean) => {
      const occupiedIds = selectedIds.filter((id) => {
        const seat = seats.find((s) => s.id === id);
        return Boolean(seat?.studentId);
      });
      if (occupiedIds.length === 0) return;
      pushUndo();
      occupiedIds.forEach((id) => {
        updateSeat(id, { isLocked: locked });
      });
      setContextMenu?.(null);
    },
    [selectedIds, seats, updateSeat, setContextMenu, pushUndo],
  );

  return {
    handleDeleteSelected,
    handleUnassignSelected,
    handleToggleLockSelected,
  };
};
