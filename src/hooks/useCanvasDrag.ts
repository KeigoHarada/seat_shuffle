import { useState, useCallback, useMemo } from "react";
import { Seat, CanvasObject } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";

const emptyImage = new Image();
if (typeof window !== "undefined") {
  emptyImage.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
}

export interface DragNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSeat: boolean;
  isLocked?: boolean;
}

export const checkCollision = (
  x: number,
  y: number,
  width: number,
  height: number,
  excludeId: string,
  nodes: DragNode[],
) => {
  return nodes.find(
    (n) =>
      n.isSeat &&
      n.id !== excludeId &&
      x < n.x + n.width &&
      x + width > n.x &&
      y < n.y + n.height &&
      y + height > n.y,
  );
};

export const useCanvasDrag = (
  seats: Seat[],
  objects: CanvasObject[],
  updateSeat: (id: string, data: Partial<Seat>) => void,
  updateObject: (id: string, data: Partial<CanvasObject>) => void,
  pan: { x: number; y: number },
  scale: number,
  viewportRef: React.RefObject<HTMLDivElement | null>,
) => {
  const nodes: DragNode[] = useMemo(() => {
    return [
      ...seats.map((s) => ({
        id: s.id,
        x: s.x,
        y: s.y,
        width: SEAT_COLS,
        height: SEAT_ROWS,
        isSeat: true,
        isLocked: s.isLocked,
      })),
      ...objects.map((o) => ({
        id: o.id,
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height,
        isSeat: false,
      })),
    ];
  }, [seats, objects]);

  const [dragState, setDragState] = useState<{
    id: string;
    width: number;
    height: number;
    visualX: number;
    visualY: number;
    validX: number;
    validY: number;
    isSwapMode: boolean;
    isSeat: boolean;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = useCallback(
    (id: string, e: React.DragEvent) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;

      setDragState({
        id,
        width: node.width,
        height: node.height,
        visualX: node.x,
        visualY: node.y,
        validX: node.x,
        validY: node.y,
        isSwapMode: false,
        isSeat: node.isSeat,
      });

      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setDragImage(emptyImage, 0, 0);

      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [nodes],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const isSwapMode = e.ctrlKey || e.metaKey;
      e.dataTransfer.dropEffect = isSwapMode ? "copy" : "move";

      if (dragState && viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        const dropX = (e.clientX - rect.left - pan.x - dragOffset.x) / scale;
        const dropY = (e.clientY - rect.top - pan.y - dragOffset.y) / scale;

        const newX = Math.max(0, Math.round(dropX / GRID_SIZE));
        const newY = Math.max(0, Math.round(dropY / GRID_SIZE));

        const collision = dragState.isSeat
          ? checkCollision(
              newX,
              newY,
              dragState.width,
              dragState.height,
              dragState.id,
              nodes,
            )
          : undefined;

        const nextValidX = collision ? dragState.validX : newX;
        const nextValidY = collision ? dragState.validY : newY;

        // If swap mode is enabled, only allow swap if both are seats
        let actualSwapMode = isSwapMode;
        if (isSwapMode) {
          const draggingNode = nodes.find((n) => n.id === dragState.id);
          if (!draggingNode || !draggingNode.isSeat) {
            actualSwapMode = false;
          }
        }

        if (
          newX !== dragState.visualX ||
          newY !== dragState.visualY ||
          nextValidX !== dragState.validX ||
          nextValidY !== dragState.validY ||
          actualSwapMode !== dragState.isSwapMode
        ) {
          setDragState({
            ...dragState,
            visualX: newX,
            visualY: newY,
            validX: nextValidX,
            validY: nextValidY,
            isSwapMode: actualSwapMode,
          });
        }
      }
    },
    [dragState, dragOffset, pan, scale, nodes, viewportRef],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragState) return;

      const draggingNode = nodes.find((n) => n.id === dragState.id);
      if (!draggingNode) {
        setDragState(null);
        return;
      }

      if (dragState.isSwapMode && draggingNode.isSeat) {
        const cx = Math.floor(dragState.visualX + draggingNode.width / 2);
        const cy = Math.floor(dragState.visualY + draggingNode.height / 2);
        const targetNode = nodes.find(
          (n) =>
            cx >= n.x &&
            cx < n.x + n.width &&
            cy >= n.y &&
            cy < n.y + n.height &&
            n.id !== dragState.id,
        );

        if (
          targetNode &&
          targetNode.isSeat &&
          !draggingNode.isLocked &&
          !targetNode.isLocked
        ) {
          const s1 = seats.find((s) => s.id === draggingNode.id);
          const s2 = seats.find((s) => s.id === targetNode.id);
          if (s1 && s2) {
            updateSeat(s1.id, { studentId: s2.studentId });
            updateSeat(s2.id, { studentId: s1.studentId });
          }
        } else {
          // Swap failed, fallback to valid position
          updateSeat(dragState.id, {
            x: dragState.validX,
            y: dragState.validY,
          });
        }
      } else {
        if (draggingNode.isSeat) {
          updateSeat(dragState.id, {
            x: dragState.validX,
            y: dragState.validY,
          });
        } else {
          updateObject(dragState.id, {
            x: dragState.validX,
            y: dragState.validY,
          });
        }
      }

      setDragState(null);
    },
    [dragState, nodes, seats, updateSeat, updateObject],
  );

  const handleDragEnd = useCallback(() => {
    setDragState(null);
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
