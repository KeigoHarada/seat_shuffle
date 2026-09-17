export const MIN_SCALE = 0.25;
export const MAX_SCALE = 2.0;
export const LONG_PRESS_MS = 520;
export const TAP_MOVE_PX = 10;

export type Point = { x: number; y: number };

/**
 * Canvas gesture priority (pointerType, not UA sniffing):
 *
 * 1. Toolbar / zoom-reset chrome: never steal (buttons keep the event).
 * 2. Two or more touch pointers, anywhere including seats: pinch zoom + pan.
 *    This cancels in-progress node drag, marquee, and long-press.
 * 3. One touch on a seat/object in edit+select: node select / drag / long-press.
 * 4. One pointer on empty canvas (or on a node while view/hand/space force pan):
 *    pan if view mode, hand tool, space, or right mouse button;
 *    otherwise left/touch drag is marquee multi-select (same as desktop).
 * 5. Mouse/trackpad otherwise unchanged: wheel pan, ctrl/meta+wheel zoom,
 *    space/hand/view pan, select-tool drag marquee.
 */
export type CanvasDownGesture = "none" | "pinch" | "pan" | "marquee" | "node";

export function isTouchPointerType(pointerType: string): boolean {
  return pointerType === "touch";
}

export function resolveCanvasDownGesture(input: {
  pointerType: string;
  button: number;
  pointerCount: number;
  onChrome: boolean;
  onNode: boolean;
  isViewMode: boolean;
  isSpaceMode: boolean;
  canvasTool: "select" | "hand";
}): CanvasDownGesture {
  if (input.onChrome) return "none";
  if (isTouchPointerType(input.pointerType) && input.pointerCount >= 2) {
    return "pinch";
  }

  const forcePan =
    input.isSpaceMode || input.canvasTool === "hand" || input.isViewMode;
  if (input.onNode && !forcePan) return "node";
  if (input.button === 2 || (input.button === 0 && forcePan)) return "pan";
  if (
    input.button === 0 &&
    input.canvasTool === "select" &&
    !input.isSpaceMode &&
    !input.isViewMode
  ) {
    return "marquee";
  }
  return "none";
}

export function shouldSelectOnNodePointerDown(input: {
  pointerType: string;
  isPrimary: boolean;
  pointerCount: number;
}): boolean {
  if (isTouchPointerType(input.pointerType) && !input.isPrimary) return false;
  return true;
}

export function shouldClearSelectionForPointerGesture(
  gesture: CanvasDownGesture,
): boolean {
  switch (gesture) {
    case "marquee":
    case "pan":
      return true;
    case "pinch":
    case "node":
    case "none":
      return false;
    default: {
      const _exhaustive: never = gesture;
      return _exhaustive;
    }
  }
}

export function isCanvasChromeTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      ".app-canvas-toolbar, .app-canvas-controls, .app-canvas-toolbar-menu",
    ),
  );
}

export function isCanvasNodeTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(".seat-node-item, .canvas-object-node"));
}

export function movedPastTap(dx: number, dy: number): boolean {
  return dx * dx + dy * dy > TAP_MOVE_PX * TAP_MOVE_PX;
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

export function trySetPointerCapture(
  target: EventTarget | null,
  pointerId: number,
): void {
  if (!(target instanceof Element)) return;
  if (typeof target.setPointerCapture !== "function") return;
  try {
    target.setPointerCapture(pointerId);
  } catch {
    return;
  }
}

export function tryReleasePointerCapture(
  target: EventTarget | null,
  pointerId: number,
): void {
  if (!(target instanceof Element)) return;
  if (typeof target.hasPointerCapture !== "function") return;
  if (!target.hasPointerCapture(pointerId)) return;
  try {
    target.releasePointerCapture(pointerId);
  } catch {
    return;
  }
}
