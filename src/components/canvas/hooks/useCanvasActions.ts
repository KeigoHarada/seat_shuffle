import type { RefObject } from "react";
import { useCanvasSelectionActions } from "./useCanvasSelectionActions";
import { useCanvasClipboard } from "./useCanvasClipboard";
import { useCanvasKeyboardShortcuts } from "./useCanvasKeyboardShortcuts";
import { useCanvasItemCreation } from "./useCanvasItemCreation";

interface UseCanvasActionsProps {
  viewportRef: RefObject<HTMLDivElement | null>;
  pan: { x: number; y: number };
  scale: number;
}

export const useCanvasActions = ({
  viewportRef,
  pan,
  scale,
}: UseCanvasActionsProps) => {
  const {
    handleDeleteSelected,
    handleUnassignSelected,
    handleToggleLockSelected,
  } = useCanvasSelectionActions();

  const { handleCopy, handlePaste, handleDuplicate } = useCanvasClipboard();

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
