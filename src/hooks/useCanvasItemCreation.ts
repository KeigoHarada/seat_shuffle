import { useCallback, type RefObject } from "react";
import type { Seat } from "../types/seat";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";
import { findEmptyPos, getCenterGridPos } from "../services/canvasGeometry";
import { generateTemplate } from "../services/templates";
import { useStore } from "../stores/appStore";

interface UseCanvasItemCreationProps {
  viewportRef: RefObject<HTMLDivElement | null>;
  pan: { x: number; y: number };
  scale: number;
  setSelectedIds: (ids: string[]) => void;
  contextMenu?: { x: number; y: number; worldX: number; worldY: number } | null;
}

export const useCanvasItemCreation = ({
  viewportRef,
  pan,
  scale,
  setSelectedIds,
  contextMenu,
}: UseCanvasItemCreationProps) => {
  const seats = useStore((state) => state.seats);
  const objects = useStore((state) => state.objects);
  const addSeat = useStore((state) => state.addSeat);
  const addObject = useStore((state) => state.addObject);
  const pushUndo = useStore((state) => state.pushUndo);

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
    pushUndo();
    addSeat(newSeat);
    setSelectedIds([newSeat.id]);
  }, [contextMenu, seats, objects, addSeat, setSelectedIds, pushUndo]);

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
    pushUndo();
    addSeat({
      id: newId,
      studentId: null,
      groupIds: [],
      x,
      y,
      isLocked: false,
    });
    setSelectedIds([newId]);
  }, [viewportRef, pan, scale, seats, objects, addSeat, setSelectedIds, pushUndo]);

  const handleAddRectangle = useCallback(() => {
    const { x: targetX, y: targetY } = getCenterGridPos(
      viewportRef,
      pan,
      scale,
    );
    const { x, y } = findEmptyPos(targetX, targetY, 12, 6, seats, objects);
    const newId = crypto.randomUUID();
    pushUndo();
    addObject({
      id: newId,
      type: "rectangle",
      x,
      y,
      width: 12,
      height: 6,
    });
    setSelectedIds([newId]);
  }, [viewportRef, pan, scale, seats, objects, addObject, setSelectedIds, pushUndo]);

  const handleAddCircle = useCallback(() => {
    const { x: targetX, y: targetY } = getCenterGridPos(
      viewportRef,
      pan,
      scale,
    );
    const { x, y } = findEmptyPos(targetX, targetY, 12, 12, seats, objects);
    const newId = crypto.randomUUID();
    pushUndo();
    addObject({
      id: newId,
      type: "circle",
      x,
      y,
      width: 12,
      height: 12,
    });
    setSelectedIds([newId]);
  }, [viewportRef, pan, scale, seats, objects, addObject, setSelectedIds, pushUndo]);

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

      const desiredStartX = targetX - Math.floor(groupWidth / 2);
      const desiredStartY = targetY - Math.floor(groupHeight / 2);

      const { x: newMinX, y: newMinY } = findEmptyPos(
        desiredStartX,
        desiredStartY,
        groupWidth,
        groupHeight,
        seats,
        objects,
      );

      const dx = newMinX - minX;
      const dy = newMinY - minY;

      const finalSeats = generatedSeats.map((s) => ({
        ...s,
        x: s.x + dx,
        y: s.y + dy,
      }));

      const newSelectedIds: string[] = [];

      pushUndo();

      finalSeats.forEach((s) => {
        addSeat(s);
        newSelectedIds.push(s.id);
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
      pushUndo,
    ],
  );

  return {
    handleAddSeatFromMenu,
    handleAddSeatCentered,
    handleAddRectangle,
    handleAddCircle,
    handleApplyTemplate,
  };
};
