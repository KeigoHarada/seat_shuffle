import { describe, expect, it } from "vitest";
import {
  clampScale,
  isCanvasChromeTarget,
  isCanvasNodeTarget,
  isTouchPointerType,
  movedPastTap,
  panByDelta,
  pointerDistance,
  pointerMidpoint,
  resolveCanvasDownGesture,
  tryReleasePointerCapture,
  trySetPointerCapture,
  zoomAroundPoint,
} from "../panZoomGesture";

describe("panZoomGesture", () => {
  it("ignores toolbar chrome when starting a canvas pan", () => {
    const toolbar = document.createElement("div");
    toolbar.className = "app-canvas-toolbar";
    const button = document.createElement("button");
    toolbar.appendChild(button);
    document.body.appendChild(toolbar);
    expect(isCanvasChromeTarget(button)).toBe(true);
    expect(isCanvasNodeTarget(button)).toBe(false);
    toolbar.remove();
  });

  it("treats seats as canvas nodes", () => {
    const seat = document.createElement("div");
    seat.className = "seat-node-item";
    document.body.appendChild(seat);
    expect(isCanvasNodeTarget(seat)).toBe(true);
    expect(isCanvasChromeTarget(seat)).toBe(false);
    seat.remove();
  });

  it("treats only touch as the finger pointer type", () => {
    expect(isTouchPointerType("touch")).toBe(true);
    expect(isTouchPointerType("mouse")).toBe(false);
    expect(isTouchPointerType("pen")).toBe(false);
  });

  it("ignores jitter below the tap move threshold", () => {
    expect(movedPastTap(3, 4)).toBe(false);
    expect(movedPastTap(8, 8)).toBe(true);
  });

  it("pans by a client delta", () => {
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

  it("swallows pointer capture when the pointer is not active", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(() => trySetPointerCapture(el, 99)).not.toThrow();
    expect(() => tryReleasePointerCapture(el, 99)).not.toThrow();
    el.remove();
  });
});

describe("resolveCanvasDownGesture", () => {
  const editSelect = {
    isViewMode: false,
    isSpaceMode: false,
    canvasTool: "select" as const,
  };

  it("never steals toolbar chrome", () => {
    expect(
      resolveCanvasDownGesture({
        pointerType: "touch",
        button: 0,
        pointerCount: 2,
        onChrome: true,
        onNode: false,
        ...editSelect,
      }),
    ).toBe("none");
  });

  it("gives two-finger touch pinch even when both fingers are on seats", () => {
    expect(
      resolveCanvasDownGesture({
        pointerType: "touch",
        button: 0,
        pointerCount: 2,
        onChrome: false,
        onNode: true,
        ...editSelect,
      }),
    ).toBe("pinch");
  });

  it("keeps one-finger seat interaction as node drag in edit select", () => {
    expect(
      resolveCanvasDownGesture({
        pointerType: "touch",
        button: 0,
        pointerCount: 1,
        onChrome: false,
        onNode: true,
        ...editSelect,
      }),
    ).toBe("node");
  });

  it("uses marquee for one-finger empty-canvas touch in edit select", () => {
    expect(
      resolveCanvasDownGesture({
        pointerType: "touch",
        button: 0,
        pointerCount: 1,
        onChrome: false,
        onNode: false,
        ...editSelect,
      }),
    ).toBe("marquee");
  });

  it("matches desktop mouse marquee on empty canvas", () => {
    expect(
      resolveCanvasDownGesture({
        pointerType: "mouse",
        button: 0,
        pointerCount: 1,
        onChrome: false,
        onNode: false,
        ...editSelect,
      }),
    ).toBe("marquee");
  });

  it("pans with one touch in view mode including when it starts on a seat", () => {
    expect(
      resolveCanvasDownGesture({
        pointerType: "touch",
        button: 0,
        pointerCount: 1,
        onChrome: false,
        onNode: true,
        isViewMode: true,
        isSpaceMode: false,
        canvasTool: "select",
      }),
    ).toBe("pan");
  });

  it("does not pinch mouse chords; right button pans empty canvas", () => {
    expect(
      resolveCanvasDownGesture({
        pointerType: "mouse",
        button: 2,
        pointerCount: 2,
        onChrome: false,
        onNode: false,
        ...editSelect,
      }),
    ).toBe("pan");
  });

  it("lets space/hand force pan instead of marquee", () => {
    expect(
      resolveCanvasDownGesture({
        pointerType: "mouse",
        button: 0,
        pointerCount: 1,
        onChrome: false,
        onNode: false,
        isViewMode: false,
        isSpaceMode: true,
        canvasTool: "select",
      }),
    ).toBe("pan");
    expect(
      resolveCanvasDownGesture({
        pointerType: "touch",
        button: 0,
        pointerCount: 1,
        onChrome: false,
        onNode: false,
        isViewMode: false,
        isSpaceMode: false,
        canvasTool: "hand",
      }),
    ).toBe("pan");
  });
});
