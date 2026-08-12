import {
  Seat,
  Student,
  Constraint,
  StudentStudentConstraint,
  StudentGroupConstraint,
  GroupMatchConstraint,
} from "../types";

export const evaluateStudentStudentConstraint = (
  c: StudentStudentConstraint,
  seats: Seat[],
): boolean => {
  const seat1 = seats.find((s) => s.studentId === c.studentId1);
  const seat2 = seats.find((s) => s.studentId === c.studentId2);
  if (!seat1 || !seat2) return false;

  const shareGroup = seat1.groupIds.some((gId) => seat2.groupIds.includes(gId));
  return c.matchType === "close" ? shareGroup : !shareGroup;
};

export const evaluateStudentGroupConstraint = (
  c: StudentGroupConstraint,
  seats: Seat[],
): boolean => {
  const seat = seats.find((s) => s.studentId === c.studentId);
  if (!seat) return false;

  const inGroup = seat.groupIds.some((gId) => c.groupIds.includes(gId));
  return c.matchType === "include" ? inGroup : !inGroup;
};

export const evaluateGroupMatchConstraint = (
  c: GroupMatchConstraint,
  seats: Seat[],
  students: Student[],
): boolean => {
  return c.groupIds.every((groupId) => {
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
};

export const evaluateConstraint = (
  c: Constraint,
  seats: Seat[],
  students: Student[],
): boolean => {
  if (!c.isEnabled) return true;

  switch (c.type) {
    case "student-student":
      return evaluateStudentStudentConstraint(c, seats);
    case "student-group":
      return evaluateStudentGroupConstraint(c, seats);
    case "group-match":
      return evaluateGroupMatchConstraint(c, seats, students);
    default:
      return true;
  }
};

export const assignStudentsRandomly = (
  seats: Seat[],
  students: Student[],
): { assignments: { seatId: string; studentId: string }[]; error?: string } => {
  const assignedStudentIds = new Set(
    seats.map((s) => s.studentId).filter(Boolean),
  );
  const unassignedStudents = students.filter(
    (s) => !assignedStudentIds.has(s.id),
  );

  const availableSeats = seats.filter((s) => !s.studentId && !s.isLocked);

  if (unassignedStudents.length === 0) {
    return { assignments: [], error: "割り当て待ちの生徒がいません。" };
  }

  if (availableSeats.length === 0) {
    return {
      assignments: [],
      error: "空席がありません。座席を追加してください。",
    };
  }

  const shuffledStudents = [...unassignedStudents].sort(
    () => Math.random() - 0.5,
  );
  const shuffledSeats = [...availableSeats].sort(() => Math.random() - 0.5);

  const assignCount = Math.min(shuffledStudents.length, shuffledSeats.length);
  const assignments: { seatId: string; studentId: string }[] = [];

  for (let i = 0; i < assignCount; i++) {
    assignments.push({
      seatId: shuffledSeats[i].id,
      studentId: shuffledStudents[i].id,
    });
  }

  return { assignments };
};
