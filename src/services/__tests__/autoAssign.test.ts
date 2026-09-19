import { describe, expect, it } from "vitest";
import { autoAssignStudents } from "../autoAssign";
import { Seat } from "../../types/seat";
import { Student } from "../../types/student";

const seat = (
  id: string,
  extras: Partial<Seat> = {},
): Seat => ({
  id,
  x: 0,
  y: 0,
  studentId: null,
  groupIds: [],
  isLocked: false,
  ...extras,
});

const student = (id: string, attendanceNumber: number): Student => ({
  id,
  name: id,
  gender: "male",
  attendanceNumber,
  roleIds: [],
});

describe("autoAssignStudents", () => {
  it("returns no-waiting-students when every student already has a seat", () => {
    const result = autoAssignStudents(
      [seat("a", { studentId: "s1" })],
      [student("s1", 1)],
    );
    expect(result).toEqual({
      assignments: [],
      error: "no-waiting-students",
    });
  });

  it("returns no-empty-seats when unlocked empty seats are gone", () => {
    const result = autoAssignStudents(
      [seat("a", { studentId: "s1" }), seat("b", { isLocked: true })],
      [student("s1", 1), student("s2", 2)],
    );
    expect(result).toEqual({
      assignments: [],
      error: "no-empty-seats",
    });
  });
});
