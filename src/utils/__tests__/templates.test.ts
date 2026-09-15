import { describe, it, expect } from "vitest";
import { generateTemplate } from "../templates";

describe("templates utils", () => {
  describe("generateTemplate - classroom", () => {
    it("should generate 30 seats in 2-person pairs across 3 columns and 5 rows, plus a teacher desk", () => {
      const { seats, objects } = generateTemplate("classroom", 0, 0);

      expect(seats).toHaveLength(30);
      expect(objects).toHaveLength(1);
      expect(objects[0].text).toBe("教卓");

      // Verify X offsets for 6 columns (3 pairs)
      const distinctX = Array.from(new Set(seats.map((s) => s.x))).sort(
        (a, b) => a - b,
      );
      expect(distinctX).toEqual([0, 6, 14, 20, 28, 34]);

      // Verify Y offsets for 5 rows
      const distinctY = Array.from(new Set(seats.map((s) => s.y))).sort(
        (a, b) => a - b,
      );
      expect(distinctY).toEqual([0, 6, 12, 18, 24]);
    });
  });

  describe("generateTemplate - groups", () => {
    it("should generate 4-person group", () => {
      const { seats } = generateTemplate("group4", 10, 20);
      expect(seats).toHaveLength(4);
    });

    it("should generate 6-person group (vertical)", () => {
      const { seats } = generateTemplate("group6_v", 10, 20);
      expect(seats).toHaveLength(6);
    });

    it("should generate 6-person group (horizontal)", () => {
      const { seats } = generateTemplate("group6_h", 10, 20);
      expect(seats).toHaveLength(6);
    });
  });

  describe("generateTemplate - bus", () => {
    it("should generate a 2-aisle-2 school-trip bus with empty seats and a driver's seat", () => {
      const { seats, objects } = generateTemplate("bus", 10, 20);

      expect(seats).toHaveLength(40);
      expect(objects).toHaveLength(1);
      expect(objects[0].text).toBe("運転席");
      expect(objects[0].x).toBe(36);
      expect(objects[0].y).toBe(14);

      expect(seats.every((s) => s.studentId === null)).toBe(true);
      expect(seats.every((s) => s.groupIds.length === 0)).toBe(true);
      expect(seats.every((s) => s.isLocked === false)).toBe(true);

      const distinctX = Array.from(new Set(seats.map((s) => s.x))).sort(
        (a, b) => a - b,
      );
      expect(distinctX).toEqual([10, 16, 30, 36]);

      const distinctY = Array.from(new Set(seats.map((s) => s.y))).sort(
        (a, b) => a - b,
      );
      expect(distinctY).toEqual([20, 26, 32, 38, 44, 50, 56, 62, 68, 74]);

      // Inner gap (aisle) is wider than the gap inside each 2-seat pair
      expect(distinctX[2] - distinctX[1]).toBeGreaterThan(
        distinctX[1] - distinctX[0],
      );
    });
  });
});
