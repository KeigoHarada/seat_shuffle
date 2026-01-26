import { describe, it, expect } from "vitest";
import { RandomShuffleAlgorithm } from "./RandomShuffleAlgorithm";
import { SAMPLE_STUDENTS } from "../stores/sampleData";
import type { Seat, Student, Condition } from "../types";

function buildTestSeats(students: Student[]): Seat[] {
  const seats: Seat[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      seats.push({
        id: `seat-${row}-${col}`,
        row,
        col,
        isEmpty: false,
        groupIds: [],
      });
    }
  }
  seats[3]!.isEmpty = true;
  seats[7]!.isEmpty = true;
  seats[0]!.studentId = students[0]!.id;
  seats[1]!.studentId = students[1]!.id;
  seats[2]!.studentId = students[2]!.id;
  seats[4]!.studentId = students[3]!.id;
  seats[5]!.studentId = students[4]!.id;
  seats[6]!.studentId = students[5]!.id;
  seats[8]!.studentId = students[6]!.id;
  seats[9]!.studentId = students[7]!.id;
  return seats;
}

function buildInitialAssignment(
  seats: Seat[],
): Record<string, string | undefined> {
  const a: Record<string, string | undefined> = {};
  for (const s of seats) {
    if (s.isEmpty) a[s.id] = undefined;
    else a[s.id] = s.studentId;
  }
  return a;
}

function formatDisplay(
  seats: Seat[],
  assignment: Record<string, string | undefined>,
  students: Student[],
): string {
  const idToName = (id: string) =>
    students.find((s) => s.id === id)?.name ?? "?";
  const lines: string[] = [];
  for (const seat of seats) {
    const v = assignment[seat.id];
    let label: string;
    if (seat.isEmpty) label = "（空席）";
    else if (v === undefined) label = "（名無し）";
    else label = idToName(v);
    lines.push(`  ${seat.id} → ${label}`);
  }
  return lines.join("\n");
}

describe("RandomShuffleAlgorithm", () => {
  it("正常系: シャッフルが成功し、全席に割り当てが行われる", async () => {
    const students = SAMPLE_STUDENTS.slice(0, 8);
    const seats = buildTestSeats(students);
    const conditions: Condition[] = [];
    const groups: readonly { id: string }[] = [];
    const roles: readonly { id: string }[] = [];

    const beforeAssignment = buildInitialAssignment(seats);

    const alg = new RandomShuffleAlgorithm();
    const result = await alg.shuffle(
      students,
      seats,
      conditions,
      groups as never,
      roles as never,
    );

    expect(result.success).toBe(true);
    expect(result.assignment).toBeDefined();
    expect(result.error).toBeUndefined();

    const assignment = result.assignment!;

    const assignedCount = Object.values(assignment).filter(
      (v) => v !== undefined,
    ).length;

    expect(assignedCount).toBe(students.length);
    expect(Object.keys(assignment)).toHaveLength(seats.length);

    for (const seat of seats) {
      expect(assignment).toHaveProperty(seat.id);
      if (seat.isEmpty) {
        expect(assignment[seat.id]).toBeUndefined();
      }
    }

    const beforeDisplay = formatDisplay(seats, beforeAssignment, students);
    const afterDisplay = formatDisplay(seats, assignment, students);

    console.log("\n【シャッフル前】\n" + beforeDisplay);
    console.log("\n【シャッフル後】\n" + afterDisplay);
  });
});
