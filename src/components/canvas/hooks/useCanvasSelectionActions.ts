import { useCallback } from "react";
import { useStore } from "../../../stores/appStore";
import { useCanvasOverlayStore } from "../../../stores/canvasOverlay";
import { useCanvasSelectionStore } from "../../../stores/canvasSelection";

export const useCanvasSelectionActions = () => {
  const seats = useStore((state) => state.seats);
  const removeSeat = useStore((state) => state.removeSeat);
  const removeObject = useStore((state) => state.removeObject);
  const updateSeat = useStore((state) => state.updateSeat);
  const pushUndo = useStore((state) => state.pushUndo);

  const selectedIds = useCanvasSelectionStore((state) => state.selectedIds);
  const clearSelection = useCanvasSelectionStore(
    (state) => state.clearSelection,
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    pushUndo();
    selectedIds.forEach((id) => {
      removeSeat(id);
      removeObject(id);
    });
    clearSelection();
    useCanvasOverlayStore.getState().closeContextMenu();
  }, [selectedIds, removeSeat, removeObject, clearSelection, pushUndo]);

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
    useCanvasOverlayStore.getState().closeContextMenu();
  }, [selectedIds, seats, updateSeat, clearSelection, pushUndo]);

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
      useCanvasOverlayStore.getState().closeContextMenu();
    },
    [selectedIds, seats, updateSeat, pushUndo],
  );

  return {
    handleDeleteSelected,
    handleUnassignSelected,
    handleToggleLockSelected,
  };
};
