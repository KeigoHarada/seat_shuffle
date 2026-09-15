export const MIN_SCALE = 0.25;
export const MAX_SCALE = 2.0;

export type Point = { x: number; y: number };

export function isTouchPointerType(pointerType: string): boolean {
  return pointerType === "touch";
}

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function panByDelta(pan: Point, dx: number, dy: number): Point {
  return { x: pan.x + dx, y: pan.y + dy };
}

export function zoomAroundPoint(
  pan: Point,
  scale: number,
  nextScale: number,
  point: Point,
): { pan: Point; scale: number } {
  const clamped = clampScale(nextScale);
  const factor = clamped / scale;
  return {
    scale: clamped,
    pan: {
      x: point.x - (point.x - pan.x) * factor,
      y: point.y - (point.y - pan.y) * factor,
    },
  };
}

export function pointerDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function pointerMidpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
