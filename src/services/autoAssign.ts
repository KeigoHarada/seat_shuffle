import type { Seat } from "../types/seat";
import type { Student } from "../types/student";

export type AutoAssignError = "no-waiting-students" | "no-empty-seats";

export const autoAssignStudents = (
  seats: Seat[],
  students: Student[],
  algorithm:
    | "right-top-down"
    | "left-top-down"
    | "left-top-right"
    | "random" = "right-top-down",
): {
  assignments: { seatId: string; studentId: string }[];
  error?: AutoAssignError;
} => {
  const assignedStudentIds = new Set(
    seats.map((s) => s.studentId).filter(Boolean),
  );
  const unassignedStudents = students.filter(
    (s) => !assignedStudentIds.has(s.id),
  );

  const availableSeats = seats.filter((s) => !s.studentId && !s.isLocked);

  if (unassignedStudents.length === 0) {
    return { assignments: [], error: "no-waiting-students" };
  }

  if (availableSeats.length === 0) {
    return { assignments: [], error: "no-empty-seats" };
  }

  let sortedStudents = [...unassignedStudents];
  if (algorithm !== "random") {
    sortedStudents.sort((a, b) => a.attendanceNumber - b.attendanceNumber);
  } else {
    sortedStudents.sort(() => Math.random() - 0.5);
  }

  const sortedSeats = [...availableSeats].sort((a, b) => {
    if (algorithm === "random") {
      return Math.random() - 0.5;
    }

    if (algorithm === "left-top-down") {
      if (Math.abs(a.x - b.x) > 0.1) {
        return a.x - b.x;
      }
      return a.y - b.y;
    }

    if (algorithm === "left-top-right") {
      if (Math.abs(a.y - b.y) > 0.1) {
        return a.y - b.y;
      }
      return a.x - b.x;
    }

    if (Math.abs(b.x - a.x) > 0.1) {
      return b.x - a.x;
    }
    return a.y - b.y;
  });

  const assignCount = Math.min(sortedStudents.length, sortedSeats.length);
  const assignments: { seatId: string; studentId: string }[] = [];

  for (let i = 0; i < assignCount; i++) {
    assignments.push({
      seatId: sortedSeats[i].id,
      studentId: sortedStudents[i].id,
    });
  }

  return { assignments };
};
