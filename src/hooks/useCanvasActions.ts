import { useCallback, useEffect } from "react";
import { Seat, CanvasObject } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";
import { findEmptyPos, getCenterGridPos } from "../utils/canvas";
import { generateTemplate } from "../utils/templates";

let clipboard: { seats: Seat[]; objects: CanvasObject[] } | null = null;

export const useCanvasActions = (
  seats: Seat[],
  objects: CanvasObject[],
  addSeat: (seat: Seat) => void,
  updateSeat: (id: string, updates: Partial<Seat>) => void,
  removeSeat: (id: string) => void,
  addObject: (obj: CanvasObject) => void,
  removeObject: (id: string) => void,
  selectedIds: string[],
  setSelectedIds: (ids: string[]) => void,
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

  const handleUnassignSelected = useCallback(() => {
    selectedIds.forEach((id) => {
      const seat = seats.find((s) => s.id === id);
      if (seat && seat.studentId) {
        updateSeat(id, { studentId: null });
      }
    });
    clearSelection();
    setContextMenu(null);
  }, [selectedIds, seats, updateSeat, clearSelection, setContextMenu]);

  const handleCopy = useCallback(() => {
    if (selectedIds.length === 0) return;
    const copiedSeats = seats
      .filter((s) => selectedIds.includes(s.id))
      .map((s) => ({ ...s, studentId: null }));
    const copiedObjects = objects
      .filter((o) => selectedIds.includes(o.id))
      .map((o) => ({ ...o }));

    clipboard = { seats: copiedSeats, objects: copiedObjects };
  }, [selectedIds, seats, objects]);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;
    if (clipboard.seats.length === 0 && clipboard.objects.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    clipboard.seats.forEach((s) => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x + SEAT_COLS);
      maxY = Math.max(maxY, s.y + SEAT_ROWS);
    });

    clipboard.objects.forEach((o) => {
      minX = Math.min(minX, o.x);
      minY = Math.min(minY, o.y);
      maxX = Math.max(maxX, o.x + o.width);
      maxY = Math.max(maxY, o.y + o.height);
    });

    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;

    const { x: newMinX, y: newMinY } = findEmptyPos(
      minX + 2,
      minY + 2,
      groupWidth,
      groupHeight,
      seats,
      objects,
    );

    const dx = newMinX - minX;
    const dy = newMinY - minY;

    const newSelectedIds: string[] = [];
    const nextClipboardSeats: Seat[] = [];
    const nextClipboardObjects: CanvasObject[] = [];

    clipboard.seats.forEach((s) => {
      const newId = crypto.randomUUID();
      newSelectedIds.push(newId);
      const newSeat = { ...s, id: newId, x: s.x + dx, y: s.y + dy };
      addSeat(newSeat);
      nextClipboardSeats.push(newSeat);
    });

    clipboard.objects.forEach((o) => {
      const newId = crypto.randomUUID();
      newSelectedIds.push(newId);
      const newObj = { ...o, id: newId, x: o.x + dx, y: o.y + dy };
      addObject(newObj);
      nextClipboardObjects.push(newObj);
    });

    clipboard = {
      seats: nextClipboardSeats,
      objects: nextClipboardObjects,
    };

    setSelectedIds(newSelectedIds);
  }, [addSeat, addObject, setSelectedIds, seats, objects]);

  const handleDuplicate = useCallback(() => {
    handleCopy();
    handlePaste();
  }, [handleCopy, handlePaste]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if ((e.key === "Delete" || e.key === "Backspace") && e.altKey) {
        handleUnassignSelected();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        handlePaste();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteSelected, handleUnassignSelected, handleCopy, handlePaste]);

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
    setSelectedIds([newSeat.id]);
  }, [contextMenu, seats, objects, addSeat, setSelectedIds]);

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

    const newId = crypto.randomUUID();
    addSeat({
      id: newId,
      studentId: null,
      groupIds: [],
      x,
      y,
      isLocked: false,
    });
    setSelectedIds([newId]);
  }, [viewportRef, pan, scale, seats, objects, addSeat, setSelectedIds]);

  const handleAddRectangle = useCallback(() => {
    const { x: targetX, y: targetY } = getCenterGridPos(
      viewportRef,
      pan,
      scale,
    );
    const { x, y } = findEmptyPos(targetX, targetY, 12, 6, seats, objects);
    const newId = crypto.randomUUID();
    addObject({
      id: newId,
      type: "rectangle",
      x,
      y,
      width: 12,
      height: 6,
    });
    setSelectedIds([newId]);
  }, [viewportRef, pan, scale, seats, objects, addObject, setSelectedIds]);

  const handleAddCircle = useCallback(() => {
    const { x: targetX, y: targetY } = getCenterGridPos(
      viewportRef,
      pan,
      scale,
    );
    const { x, y } = findEmptyPos(targetX, targetY, 12, 12, seats, objects);
    const newId = crypto.randomUUID();
    addObject({
      id: newId,
      type: "circle",
      x,
      y,
      width: 12,
      height: 12,
    });
    setSelectedIds([newId]);
  }, [viewportRef, pan, scale, seats, objects, addObject, setSelectedIds]);

  const handleApplyTemplate = useCallback(
    (templateId: string) => {
      const { x: targetX, y: targetY } = getCenterGridPos(
        viewportRef,
        pan,
        scale,
      );
      const { seats: generatedSeats, objects: generatedObjects } =
        generateTemplate(templateId, targetX, targetY);

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      generatedSeats.forEach((s) => {
        minX = Math.min(minX, s.x);
        minY = Math.min(minY, s.y);
        maxX = Math.max(maxX, s.x + SEAT_COLS);
        maxY = Math.max(maxY, s.y + SEAT_ROWS);
      });

      generatedObjects.forEach((o) => {
        minX = Math.min(minX, o.x);
        minY = Math.min(minY, o.y);
        maxX = Math.max(maxX, o.x + o.width);
        maxY = Math.max(maxY, o.y + o.height);
      });

      if (minX === Infinity) return;

      const groupWidth = maxX - minX;
      const groupHeight = maxY - minY;

      const { x: newMinX, y: newMinY } = findEmptyPos(
        minX,
        minY,
        groupWidth,
        groupHeight,
        seats,
        objects,
      );

      const dx = newMinX - minX;
      const dy = newMinY - minY;

      const newSelectedIds: string[] = [];

      generatedSeats.forEach((s) => {
        const newSeat = { ...s, x: s.x + dx, y: s.y + dy };
        addSeat(newSeat);
        newSelectedIds.push(newSeat.id);
      });

      generatedObjects.forEach((o) => {
        const newObj = { ...o, x: o.x + dx, y: o.y + dy };
        addObject(newObj);
        newSelectedIds.push(newObj.id);
      });

      setSelectedIds(newSelectedIds);
    },
    [
      viewportRef,
      pan,
      scale,
      addSeat,
      addObject,
      setSelectedIds,
      seats,
      objects,
    ],
  );

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
  };
};
