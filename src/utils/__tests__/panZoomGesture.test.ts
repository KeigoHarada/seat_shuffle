import { describe, expect, it } from "vitest";
import {
  clampScale,
  isTouchPointerType,
  panByDelta,
  pointerDistance,
  pointerMidpoint,
  zoomAroundPoint,
} from "../panZoomGesture";

describe("panZoomGesture", () => {
  it("treats only touch as the finger pointer type", () => {
    expect(isTouchPointerType("touch")).toBe(true);
    expect(isTouchPointerType("mouse")).toBe(false);
    expect(isTouchPointerType("pen")).toBe(false);
  });

  it("pans by client deltas instead of movementX", () => {
    expect(panByDelta({ x: 10, y: 20 }, 5, -3)).toEqual({ x: 15, y: 17 });
  });

  it("zooms around a viewport point", () => {
    const next = zoomAroundPoint({ x: 0, y: 0 }, 1, 2, { x: 100, y: 50 });
    expect(next.scale).toBe(2);
    expect(next.pan).toEqual({ x: -100, y: -50 });
  });

  it("clamps scale to the canvas range", () => {
    expect(clampScale(0.01)).toBe(0.25);
    expect(clampScale(8)).toBe(2);
  });

  it("measures pinch geometry", () => {
    expect(pointerDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(pointerMidpoint({ x: 0, y: 0 }, { x: 10, y: 6 })).toEqual({
      x: 5,
      y: 3,
    });
  });
});
