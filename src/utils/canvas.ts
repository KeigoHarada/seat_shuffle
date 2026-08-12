import { Seat, CanvasObject } from "../types";
import { SEAT_COLS, SEAT_ROWS, GRID_SIZE } from "../constants/canvas";

export interface DragState {
  baseId: string;
  draggedIds: string[];
  startX: number;
  startY: number;
  visualDeltaX: number;
  visualDeltaY: number;
  validDeltaX: number;
  validDeltaY: number;
  isSwapMode: boolean;
}

export interface DragState {
  baseId: string;
  draggedIds: string[];
  startX: number;
  startY: number;
  visualDeltaX: number;
  visualDeltaY: number;
  validDeltaX: number;
  validDeltaY: number;
  isSwapMode: boolean;
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

export const screenToWorld = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  pan: { x: number; y: number },
  scale: number,
) => {
  const worldX = (clientX - rect.left - pan.x) / scale;
  const worldY = (clientY - rect.top - pan.y) / scale;
  return { worldX, worldY };
};

export const worldToGrid = (worldX: number, worldY: number) => {
  return {
    x: Math.floor(worldX / GRID_SIZE),
    y: Math.floor(worldY / GRID_SIZE),
  };
};

export const getCenterGridPos = (
  viewportRef: React.RefObject<HTMLDivElement | null>,
  pan: { x: number; y: number },
  scale: number,
) => {
  if (!viewportRef.current) return { x: 0, y: 0 };
  const rect = viewportRef.current.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const worldX = (centerX - pan.x) / scale;
  const worldY = (centerY - pan.y) / scale;
  return worldToGrid(worldX, worldY);
};

export const checkCollision = (
  x: number,
  y: number,
  width: number,
  height: number,
  excludeIds: string[],
  nodes: DragNode[],
) => {
  return nodes.find(
    (n) =>
      n.isSeat &&
      !excludeIds.includes(n.id) &&
      x < n.x + n.width &&
      x + width > n.x &&
      y < n.y + n.height &&
      y + height > n.y,
  );
};

export const findEmptyPos = (
  startX: number,
  startY: number,
  width: number,
  height: number,
  seats: Seat[],
  objects: CanvasObject[],
) => {
  const isOccupied = (tx: number, ty: number) => {
    const hitSeat = seats.some(
      (s) =>
        tx < s.x + SEAT_COLS &&
        tx + width > s.x &&
        ty < s.y + SEAT_ROWS &&
        ty + height > s.y,
    );
    if (hitSeat) return true;

    const hitObj = objects.some(
      (o) =>
        tx < o.x + o.width &&
        tx + width > o.x &&
        ty < o.y + o.height &&
        ty + height > o.y,
    );
    return hitObj;
  };

  if (!isOccupied(startX, startY)) return { x: startX, y: startY };

  let radius = 1;
  while (radius < 50) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const testX = startX + dx * width;
        const testY = startY + dy * height;
        if (!isOccupied(testX, testY)) {
          return { x: testX, y: testY };
        }
      }
    }
    radius++;
  }
  return { x: startX, y: startY };
};

export const getSeatDragDisplayProps = (
  seat: Seat,
  dragState: DragState | null,
  seats: Seat[],
) => {
  let displaySeat = seat;
  let isSwapTarget = false;
  const isDragging = !!dragState?.draggedIds.includes(seat.id);

  let ghostSeat: Seat | undefined = undefined;

  if (isDragging && dragState) {
    if (dragState.isSwapMode) {
      ghostSeat = {
        ...seat,
        x: seat.x + dragState.visualDeltaX,
        y: seat.y + dragState.visualDeltaY,
      };
    } else {
      displaySeat = {
        ...seat,
        x: seat.x + dragState.validDeltaX,
        y: seat.y + dragState.validDeltaY,
      };
    }
  } else if (dragState?.isSwapMode && dragState.baseId) {
    const baseNode = seats.find((s) => s.id === dragState.baseId);
    if (baseNode) {
      const cx = Math.floor(
        baseNode.x + dragState.visualDeltaX + SEAT_COLS / 2,
      );
      const cy = Math.floor(
        baseNode.y + dragState.visualDeltaY + SEAT_ROWS / 2,
      );
      if (
        cx >= seat.x &&
        cx < seat.x + SEAT_COLS &&
        cy >= seat.y &&
        cy < seat.y + SEAT_ROWS &&
        seat.id !== dragState.baseId
      ) {
        isSwapTarget = true;
      }
    }
  }

  return { displaySeat, ghostSeat, isSwapTarget, isDragging };
};

export const getObjectDragDisplayProps = (
  obj: CanvasObject,
  dragState: DragState | null,
) => {
  const isDragging = !!dragState?.draggedIds.includes(obj.id);
  const displayObj =
    isDragging && dragState
      ? {
          ...obj,
          x: obj.x + dragState.visualDeltaX,
          y: obj.y + dragState.visualDeltaY,
        }
      : obj;

  return { displayObj, isDragging };
};
