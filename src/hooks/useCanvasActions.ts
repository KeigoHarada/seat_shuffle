import { useCallback, useEffect } from "react";
import { Seat, CanvasObject } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";
import { findEmptyPos, getCenterGridPos } from "../utils/canvas";
import { generateTemplate } from "../utils/templates";

export const useCanvasActions = (
  seats: Seat[],
  objects: CanvasObject[],
  addSeat: (seat: Seat) => void,
  removeSeat: (id: string) => void,
  addObject: (obj: CanvasObject) => void,
  removeObject: (id: string) => void,
  selectedIds: string[],
  clearSelection: () => void,
  contextMenu: { x: number; y: number; worldX: number; worldY: number } | null,
  setContextMenu: (menu: null) => void,
  viewportRef: React.RefObject<HTMLDivElement | null>,
  pan: { x: number; y: number },
  scale: number,
) => {
  const handleDeleteSelected = useCallback(() => {
    selectedIds.forEach((id) => {
      removeSeat(id);
      removeObject(id);
    });
    clearSelection();
    setContextMenu(null);
  }, [selectedIds, removeSeat, removeObject, clearSelection, setContextMenu]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return;
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteSelected]);

  const handleAddSeatFromMenu = useCallback(() => {
    if (!contextMenu) return;

    const targetX = Math.floor(contextMenu.worldX / GRID_SIZE);
    const targetY = Math.floor(contextMenu.worldY / GRID_SIZE);

    const { x, y } = findEmptyPos(
      targetX,
      targetY,
      SEAT_COLS,
      SEAT_ROWS,
      seats,
      objects,
    );

    const newSeat: Seat = {
      id: crypto.randomUUID(),
      studentId: null,
      groupIds: [],
      x,
      y,
      isLocked: false,
    };
    addSeat(newSeat);
  }, [contextMenu, seats, objects, addSeat]);

  const handleAddSeatCentered = useCallback(() => {
    const { x: targetX, y: targetY } = getCenterGridPos(
      viewportRef,
      pan,
      scale,
    );
    const { x, y } = findEmptyPos(
      targetX,
      targetY,
      SEAT_COLS,
      SEAT_ROWS,
      seats,
      objects,
    );

    addSeat({
      id: crypto.randomUUID(),
      studentId: null,
      groupIds: [],
      x,
      y,
      isLocked: false,
    });
  }, [viewportRef, pan, scale, seats, objects, addSeat]);

  const handleAddRectangle = useCallback(() => {
    const { x: targetX, y: targetY } = getCenterGridPos(
      viewportRef,
      pan,
      scale,
    );
    const { x, y } = findEmptyPos(targetX, targetY, 12, 6, seats, objects);
    addObject({
      id: crypto.randomUUID(),
      type: "rectangle",
      x,
      y,
      width: 12,
      height: 6,
    });
  }, [viewportRef, pan, scale, seats, objects, addObject]);

  const handleAddCircle = useCallback(() => {
    const { x: targetX, y: targetY } = getCenterGridPos(
      viewportRef,
      pan,
      scale,
    );
    const { x, y } = findEmptyPos(targetX, targetY, 12, 12, seats, objects);
    addObject({
      id: crypto.randomUUID(),
      type: "circle",
      x,
      y,
      width: 12,
      height: 12,
    });
  }, [viewportRef, pan, scale, seats, objects, addObject]);

  const handleApplyTemplate = useCallback(
    (templateId: string) => {
      const { x, y } = getCenterGridPos(viewportRef, pan, scale);
      const { seats: newSeats, objects: newObjects } = generateTemplate(
        templateId,
        x,
        y,
      );
      newSeats.forEach(addSeat);
      newObjects.forEach(addObject);
    },
    [viewportRef, pan, scale, addSeat, addObject],
  );

  return {
    handleDeleteSelected,
    handleAddSeatFromMenu,
    handleAddSeatCentered,
    handleAddRectangle,
    handleAddCircle,
    handleApplyTemplate,
  };
};
