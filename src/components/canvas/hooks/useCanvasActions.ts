import type { RefObject } from "react";
import type { Seat } from "../../../types/seat";
import type { CanvasObject } from "../../../types/canvas";
import { useCanvasSelectionActions } from "./useCanvasSelectionActions";
import { useCanvasClipboard } from "./useCanvasClipboard";
import { useCanvasKeyboardShortcuts } from "./useCanvasKeyboardShortcuts";
import { useCanvasItemCreation } from "./useCanvasItemCreation";

export const useCanvasActions = (
  _seats: Seat[],
  _objects: CanvasObject[],
  _addSeat: (seat: Seat) => void,
  _updateSeat: (id: string, updates: Partial<Seat>) => void,
  _removeSeat: (id: string) => void,
  _addObject: (obj: CanvasObject) => void,
  _removeObject: (id: string) => void,
  selectedIds: string[],
  setSelectedIds: (ids: string[]) => void,
  clearSelection: () => void,
  contextMenu: { x: number; y: number; worldX: number; worldY: number } | null,
  setContextMenu: (menu: null) => void,
  viewportRef: RefObject<HTMLDivElement | null>,
  pan: { x: number; y: number },
  scale: number,
) => {
  const {
    handleDeleteSelected,
    handleUnassignSelected,
    handleToggleLockSelected,
  } = useCanvasSelectionActions({
    selectedIds,
    clearSelection,
    setContextMenu,
  });

  const { handleCopy, handlePaste, handleDuplicate } = useCanvasClipboard({
    selectedIds,
    setSelectedIds,
  });

  useCanvasKeyboardShortcuts({
    onDelete: handleDeleteSelected,
    onUnassign: handleUnassignSelected,
    onCopy: handleCopy,
    onPaste: handlePaste,
  });

  const {
    handleAddSeatFromMenu,
    handleAddSeatCentered,
    handleAddRectangle,
    handleAddCircle,
    handleApplyTemplate,
  } = useCanvasItemCreation({
    viewportRef,
    pan,
    scale,
    setSelectedIds,
    contextMenu,
  });

  return {
    handleDeleteSelected,
    handleUnassignSelected,
    handleCopy,
    handleDuplicate,
    handleAddSeatFromMenu,
    handleAddSeatCentered,
    handleAddRectangle,
    handleAddCircle,
    handleApplyTemplate,
    handleToggleLockSelected,
  };
};
