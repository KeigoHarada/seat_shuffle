import { describe, it, expect } from "vitest";
import { generateTemplate } from "../templates";

describe("templates utils", () => {
  describe("generateTemplate - classroom", () => {
    it("should generate 30 seats in 2-person pairs across 3 columns and 5 rows, plus a teacher desk", () => {
      const { seats, objects } = generateTemplate("classroom", 0, 0);

      expect(seats).toHaveLength(30);
      expect(objects).toHaveLength(1);
      expect(objects[0].text).toBe("教卓");

      const distinctX = Array.from(new Set(seats.map((s) => s.x))).sort(
        (a, b) => a - b,
      );
      expect(distinctX).toEqual([0, 6, 14, 20, 28, 34]);

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
});
