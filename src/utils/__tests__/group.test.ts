import { describe, it, expect } from "vitest";
import {
  assignGroupsBySeatMap,
  assignGroupsByBlocks,
} from "../group";
import { Seat, Group } from "../../types";

describe("group utils", () => {
  const mockGroups: Group[] = [
    { id: "group-1", name: "1班", color: "#FCA5A5" },
    { id: "group-2", name: "2班", color: "#93C5FD" },
    { id: "group-3", name: "3班", color: "#86EFAC" },
    { id: "group-4", name: "4班", color: "#FDE047" },
    { id: "group-5", name: "5班", color: "#D8B4FE" },
    { id: "group-6", name: "6班", color: "#FDBA74" },
  ];

  const createMockSeat = (id: string, x: number, y: number): Seat => ({
    id,
    x,
    y,
    studentId: null,
    groupIds: [],
    isLocked: false,
  });

  describe("assignGroupsBySeatMap", () => {
    it("should assign groupIds based on a record map", () => {
      const seats: Seat[] = [
        createMockSeat("s1", 0, 0),
        createMockSeat("s2", 6, 0),
      ];

      const result = assignGroupsBySeatMap(seats, {
        s1: ["group-1"],
        s2: ["group-2"],
      });

      expect(result.find((s) => s.id === "s1")?.groupIds).toEqual(["group-1"]);
      expect(result.find((s) => s.id === "s2")?.groupIds).toEqual(["group-2"]);
    });
  });

  describe("assignGroupsByBlocks", () => {
    it("should assign 30 classroom seats into 6 groups of 5 seats across 3 blocks (front/back)", () => {
      const colXOffsets = [0, 6, 14, 20, 28, 34];
      const rowYOffsets = [0, 6, 12, 18, 24];

      const seats: Seat[] = [];
      colXOffsets.forEach((x) => {
        rowYOffsets.forEach((y) => {
          seats.push(createMockSeat(`seat-${x}-${y}`, x, y));
        });
      });

      const result = assignGroupsByBlocks(seats, mockGroups, 3, 2);

      expect(result).toHaveLength(30);

      mockGroups.forEach((g) => {
        const groupSeats = result.filter((s) => s.groupIds.includes(g.id));
        expect(groupSeats).toHaveLength(5);
      });

      const g1Seats = result.filter((s) => s.groupIds.includes("group-1"));
      g1Seats.forEach((s) => {
        expect([28, 34]).toContain(s.x);
        expect([0, 6, 12]).toContain(s.y);
      });

      const g6Seats = result.filter((s) => s.groupIds.includes("group-6"));
      g6Seats.forEach((s) => {
        expect([0, 6]).toContain(s.x);
        expect([12, 18, 24]).toContain(s.y);
      });
    });

    it("should assign 30 classroom seats from left to right when specified", () => {
      const colXOffsets = [0, 6, 14, 20, 28, 34];
      const rowYOffsets = [0, 6, 12, 18, 24];

      const seats: Seat[] = [];
      colXOffsets.forEach((x) => {
        rowYOffsets.forEach((y) => {
          seats.push(createMockSeat(`seat-${x}-${y}`, x, y));
        });
      });

      const result = assignGroupsByBlocks(
        seats,
        mockGroups,
        3,
        2,
        "left-to-right",
      );

      const g1Seats = result.filter((s) => s.groupIds.includes("group-1"));
      g1Seats.forEach((s) => {
        expect([0, 6]).toContain(s.x);
        expect([0, 6, 12]).toContain(s.y);
      });
    });
  });
});
