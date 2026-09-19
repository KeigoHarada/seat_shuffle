import type { Seat } from "../types/seat";
import type { Student } from "../types/student";
import type {
  Constraint,
  StudentStudentConstraint,
  StudentGroupConstraint,
  GroupMatchConstraint,
} from "../types/constraint";

export const evaluateStudentStudentConstraint = (
  c: StudentStudentConstraint,
  seats: Seat[],
): boolean | null => {
  const seat1 = seats.find((s) => s.studentId === c.studentId1);
  const seat2 = seats.find((s) => s.studentId === c.studentId2);
  if (!seat1 || !seat2) return null;

  const shareGroup = seat1.groupIds.some((gId) => seat2.groupIds.includes(gId));
  return c.matchType === "close" ? shareGroup : !shareGroup;
};

export const evaluateStudentGroupConstraint = (
  c: StudentGroupConstraint,
  seats: Seat[],
): boolean | null => {
  const seat = seats.find((s) => s.studentId === c.studentId);
  if (!seat) return null;

  const inGroup = seat.groupIds.some((gId) => c.groupIds.includes(gId));
  return c.matchType === "include" ? inGroup : !inGroup;
};

const evaluateGroupMatchConstraint = (
  c: GroupMatchConstraint,
  seats: Seat[],
  students: Student[],
): boolean | null => {
  const isFullySeated = students.every((st) =>
    seats.some((s) => s.studentId === st.id),
  );

  const isSatisfied = c.groupIds.every((groupId) => {
    const groupSeats = seats.filter((s) => s.groupIds.includes(groupId));
    let matchCount = 0;
    groupSeats.forEach((s) => {
      if (!s.studentId) return;
      const student = students.find((st) => st.id === s.studentId);
      if (!student) return;

      if (c.targetType === "role") {
        if (student.roleIds.includes(c.targetId)) matchCount++;
      } else if (c.targetType === "gender") {
        if (student.gender === c.targetId) matchCount++;
      }
    });
    return matchCount >= c.minCount;
  });

  if (isSatisfied) return true;
  if (!isFullySeated) return null;
  return false;
};

export const evaluateConstraint = (
  c: Constraint,
  seats: Seat[],
  students: Student[],
): boolean | null => {
  if (!c.isEnabled) return true;

  switch (c.type) {
    case "student-student":
      return evaluateStudentStudentConstraint(c, seats);
    case "student-group":
      return evaluateStudentGroupConstraint(c, seats);
    case "group-match":
      return evaluateGroupMatchConstraint(c, seats, students);
    default: {
      const _exhaustive: never = c;
      return _exhaustive;
    }
  }
};
