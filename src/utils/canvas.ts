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

export interface DragNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSeat: boolean;
  isLocked?: boolean;
}

export interface CanvasBoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * キャンバス上の全座席およびオブジェクトを囲むバウンディングボックス（ピクセル単位）を計算します。
 */
export const getCanvasBoundingBox = (
  seats: Seat[],
  objects: CanvasObject[],
): CanvasBoundingBox | null => {
  if (seats.length === 0 && objects.length === 0) {
    return null;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  seats.forEach((seat) => {
    const sMinX = seat.x * GRID_SIZE;
    const sMaxX = (seat.x + SEAT_COLS) * GRID_SIZE;
    const sMinY = seat.y * GRID_SIZE;
    const sMaxY = (seat.y + SEAT_ROWS) * GRID_SIZE;

    if (sMinX < minX) minX = sMinX;
    if (sMaxX > maxX) maxX = sMaxX;
    if (sMinY < minY) minY = sMinY;
    if (sMaxY > maxY) maxY = sMaxY;
  });

  objects.forEach((obj) => {
    const oMinX = obj.x * GRID_SIZE;
    const oMaxX = (obj.x + obj.width) * GRID_SIZE;
    const oMinY = obj.y * GRID_SIZE;
    const oMaxY = (obj.y + obj.height) * GRID_SIZE;

    if (oMinX < minX) minX = oMinX;
    if (oMaxX > maxX) maxX = oMaxX;
    if (oMinY < minY) minY = oMinY;
    if (oMaxY > maxY) maxY = oMaxY;
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
};

/**
 * ビューポートの中央に座席全体が収まるように、最適な pan と scale を計算します。
 */
export const calculateCenterPanZoom = (
  seats: Seat[],
  objects: CanvasObject[],
  viewportWidth: number,
  viewportHeight: number,
  padding = 60,
  minScale = 0.5,
  maxScale = 2.0,
): { pan: { x: number; y: number }; scale: number } => {
  const bbox = getCanvasBoundingBox(seats, objects);
  if (!bbox || viewportWidth <= 0 || viewportHeight <= 0) {
    return { pan: { x: 0, y: 0 }, scale: 1 };
  }

  const availableWidth = Math.max(100, viewportWidth - padding * 2);
  const availableHeight = Math.max(100, viewportHeight - padding * 2);

  const fitScaleX = availableWidth / bbox.width;
  const fitScaleY = availableHeight / bbox.height;

  // 画面に収まる場合は基本 1.0、小さい画面（タブレット等）では適切に縮小
  const targetScale = Math.min(1.0, fitScaleX, fitScaleY, maxScale);
  const finalScale = Math.max(minScale, targetScale);

  const panX = viewportWidth / 2 - bbox.centerX * finalScale;
  const panY = viewportHeight / 2 - bbox.centerY * finalScale;

  return {
    pan: { x: Math.round(panX), y: Math.round(panY) },
    scale: Number(finalScale.toFixed(2)),
  };
};

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

/**
 * メニューやポップオーバーの位置を親コンテナ内に収まるようにクランプします。
 */
export const clampMenuPosition = (
  x: number,
  y: number,
  menuWidth: number,
  menuHeight: number,
  containerWidth: number,
  containerHeight: number,
  margin = 8,
): { left: number; top: number } => {
  let left = x;
  let top = y;

  if (left + menuWidth + margin > containerWidth) {
    left = containerWidth - menuWidth - margin;
  }
  if (top + menuHeight + margin > containerHeight) {
    top = containerHeight - menuHeight - margin;
  }
  if (left < margin) left = margin;
  if (top < margin) top = margin;

  return { left, top };
};
