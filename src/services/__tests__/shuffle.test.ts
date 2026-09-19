import { describe, expect, it } from "vitest";
import { optimizeShuffle } from "../shuffle";
import type { Seat } from "../../types/seat";
import type { Student } from "../../types/student";

const mockSeat = (id: string, isLocked = false, groupIds: string[] = []): Seat => ({
  id,
  x: 0,
  y: 0,
  studentId: null,
  groupIds,
  isLocked,
});

const mockStudent = (id: string): Student => ({
  id,
  name: id,
  gender: "male",
  attendanceNumber: 1,
  roleIds: [],
});

describe("optimizeShuffle", () => {
  it("assigns students to seats randomly without constraints", () => {
    const students = [mockStudent("s1"), mockStudent("s2")];
    const seats = [mockSeat("seat1"), mockSeat("seat2")];

    const result = optimizeShuffle(students, seats, []);
    expect(result.unsatisfiedCount).toBe(0);
    const assignedIds = result.newSeats.map((s) => s.studentId).filter(Boolean);
    expect(assignedIds).toHaveLength(2);
    expect(assignedIds).toContain("s1");
    expect(assignedIds).toContain("s2");
  });

  it("preserves locked seats during shuffle", () => {
    const students = [mockStudent("s1"), mockStudent("s2"), mockStudent("s3")];
    const seats = [
      { ...mockSeat("seat1", true), studentId: "s1" },
      mockSeat("seat2"),
      mockSeat("seat3"),
    ];

    const result = optimizeShuffle(students, seats, []);
    const seat1 = result.newSeats.find((s) => s.id === "seat1");
    expect(seat1?.studentId).toBe("s1");
  });
});
