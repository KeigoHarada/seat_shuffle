export interface CanvasObject {
  id: string;
  type: "rectangle" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color?: string;
}

export type Point = {
  x: number;
  y: number;
};

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

export type CanvasDownGesture = "none" | "pinch" | "pan" | "marquee" | "node";
