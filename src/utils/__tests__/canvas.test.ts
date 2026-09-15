import { describe, it, expect } from "vitest";
import {
  getCanvasBoundingBox,
  calculateCenterPanZoom,
  worldToGrid,
  screenToWorld,
  contextMenuFromClient,
  clampMenuPosition,
} from "../canvas";
import { generateTemplate } from "../templates";

describe("canvas utils", () => {
  describe("getCanvasBoundingBox", () => {
    it("should return null if there are no seats and no objects", () => {
      expect(getCanvasBoundingBox([], [])).toBeNull();
    });

    it("should calculate correct bounding box for standard classroom template", () => {
      const { seats, objects } = generateTemplate("classroom", 0, 0);
      const bbox = getCanvasBoundingBox(seats, objects);

      expect(bbox).not.toBeNull();
      if (bbox) {
        expect(bbox.minX).toBe(0);
        expect(bbox.maxX).toBe(800); // (34 + 6) * 20
        expect(bbox.minY).toBe(-120); // -6 * 20 (teacher desk)
        expect(bbox.maxY).toBe(560); // (24 + 4) * 20
        expect(bbox.width).toBe(800);
        expect(bbox.height).toBe(680);
        expect(bbox.centerX).toBe(400);
        expect(bbox.centerY).toBe(220);
      }
    });
  });

  describe("calculateCenterPanZoom", () => {
    it("should center classroom within a 1200x800 viewport with scale 1.0", () => {
      const { seats, objects } = generateTemplate("classroom", 0, 0);
      const result = calculateCenterPanZoom(seats, objects, 1200, 800, 60);

      expect(result.scale).toBe(1.0);
      // panX: 1200 / 2 - 400 = 200
      expect(result.pan.x).toBe(200);
      // panY: 800 / 2 - 220 = 180
      expect(result.pan.y).toBe(180);
    });

    it("should scale down when viewport is smaller than classroom dimensions", () => {
      const { seats, objects } = generateTemplate("classroom", 0, 0);
      const result = calculateCenterPanZoom(seats, objects, 600, 500, 30);

      expect(result.scale).toBeLessThan(1.0);
      expect(result.scale).toBeGreaterThanOrEqual(0.5);
    });

    it("can scale below 50% so a classroom fits a phone canvas", () => {
      const { seats, objects } = generateTemplate("classroom", 0, 0);
      const result = calculateCenterPanZoom(seats, objects, 375, 495, 24, 0.25);

      expect(result.scale).toBeLessThan(0.5);
      expect(result.scale).toBeGreaterThanOrEqual(0.25);
    });
  });

  describe("coordinate conversions", () => {
    it("should convert world coordinates to grid coordinates", () => {
      expect(worldToGrid(0, 0)).toEqual({ x: 0, y: 0 });
      expect(worldToGrid(40, 60)).toEqual({ x: 2, y: 3 });
      expect(worldToGrid(45, 65)).toEqual({ x: 2, y: 3 });
    });

    it("should convert screen coordinates to world coordinates", () => {
      const rect = { left: 100, top: 50 } as DOMRect;
      const pan = { x: 50, y: 20 };
      const scale = 1.5;

      const { worldX, worldY } = screenToWorld(300, 200, rect, pan, scale);
      // worldX = (300 - 100 - 50) / 1.5 = 150 / 1.5 = 100
      // worldY = (200 - 50 - 20) / 1.5 = 130 / 1.5 = 86.666...
      expect(worldX).toBe(100);
      expect(Math.round(worldY)).toBe(87);
    });

    it("builds a context menu point from client coordinates", () => {
      const rect = { left: 40, top: 20 } as DOMRect;
      const menu = contextMenuFromClient(90, 70, rect, { x: 10, y: 5 }, 2);
      expect(menu).toEqual({
        x: 50,
        y: 50,
        worldX: 20,
        worldY: 22.5,
      });
    });
  });

  describe("clampMenuPosition", () => {
    it("should not adjust position when menu fits within container", () => {
      const result = clampMenuPosition(100, 100, 150, 200, 800, 600);

      expect(result).toEqual({ left: 100, top: 100 });
    });

    it("should clamp when overflowing right edge", () => {
      const result = clampMenuPosition(700, 100, 150, 200, 800, 600);

      expect(result).toEqual({ left: 800 - 150 - 8, top: 100 });
    });

    it("should clamp when overflowing bottom edge", () => {
      const result = clampMenuPosition(100, 450, 150, 200, 800, 600);

      expect(result).toEqual({ left: 100, top: 600 - 200 - 8 });
    });

    it("should clamp both axes when overflowing bottom-right corner", () => {
      const result = clampMenuPosition(700, 450, 150, 200, 800, 600);

      expect(result).toEqual({ left: 800 - 150 - 8, top: 600 - 200 - 8 });
    });

    it("should clamp to margin when position is negative", () => {
      const result = clampMenuPosition(-10, -20, 150, 200, 800, 600);

      expect(result).toEqual({ left: 8, top: 8 });
    });

    it("should use custom margin", () => {
      const result = clampMenuPosition(780, 100, 150, 200, 800, 600, 16);

      expect(result).toEqual({ left: 800 - 150 - 16, top: 100 });
    });
  });
});
