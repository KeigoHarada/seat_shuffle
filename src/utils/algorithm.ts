import {
  Seat,
  Student,
  Constraint,
  StudentStudentConstraint,
  StudentGroupConstraint,
  GroupMatchConstraint,
} from "../types";

const SHUFFLE_MAX_SWAPS = 50000;
const SHUFFLE_TIME_BUDGET_MS = 300;
const SHUFFLE_ACCEPT_WORSE_RATE = 0.01;

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

export const evaluateGroupMatchConstraint = (
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

export const optimizeShuffle = (
  students: Student[],
  seats: Seat[],
  constraints: Constraint[],
): { newSeats: Seat[]; unsatisfiedCount: number } => {
  const lockedSeats = seats.filter((s) => s.isLocked);
  const lockedStudentIds = new Set(
    lockedSeats.map((s) => s.studentId).filter(Boolean),
  );

  const availableSeats = seats.filter((s) => !s.isLocked);
  const availableStudents = students.filter((s) => !lockedStudentIds.has(s.id));

  const activeConstraints = constraints.filter((c) => c.isEnabled);

  let currentAssignment: (string | null)[] = availableStudents.map((s) => s.id);
  while (currentAssignment.length < availableSeats.length) {
    currentAssignment.push(null);
  }

  for (let i = currentAssignment.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentAssignment[i], currentAssignment[j]] = [
      currentAssignment[j],
      currentAssignment[i],
    ];
  }

  if (activeConstraints.length === 0 || availableSeats.length === 0) {
    const newSeats = seats.map((s) => {
      if (s.isLocked) return s;
      const idx = availableSeats.findIndex((avail) => avail.id === s.id);
      return { ...s, studentId: currentAssignment[idx] };
    });
    return { newSeats, unsatisfiedCount: 0 };
  }

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  const seatGroupMap = new Map<string, Set<string>>();
  seats.forEach((s) => seatGroupMap.set(s.id, new Set(s.groupIds)));

  const calculateScore = (assignment: (string | null)[]) => {
    let score = 0;
    let unsatisfiedCount = 0;

    const studentToSeat = new Map<string, Seat>();
    lockedSeats.forEach((s) => {
      if (s.studentId) studentToSeat.set(s.studentId, s);
    });
    assignment.forEach((studentId, idx) => {
      if (studentId) studentToSeat.set(studentId, availableSeats[idx]);
    });

    for (const c of activeConstraints) {
      if (c.type === "student-student") {
        const seat1 = studentToSeat.get(c.studentId1);
        const seat2 = studentToSeat.get(c.studentId2);
        if (seat1 && seat2) {
          const g1 = seatGroupMap.get(seat1.id)!;
          const g2 = seatGroupMap.get(seat2.id)!;
          let overlap = false;
          for (const g of g1) {
            if (g2.has(g)) {
              overlap = true;
              break;
            }
          }
          if (c.matchType === "close" && !overlap) {
            score += 100;
            unsatisfiedCount++;
          }
          if (c.matchType === "far" && overlap) {
            score += 100;
            unsatisfiedCount++;
          }
        }
      } else if (c.type === "student-group") {
        const seat = studentToSeat.get(c.studentId);
        if (seat) {
          const sg = seatGroupMap.get(seat.id)!;
          let overlap = false;
          for (const g of c.groupIds) {
            if (sg.has(g)) {
              overlap = true;
              break;
            }
          }
          if (c.matchType === "include" && !overlap) {
            score += 100;
            unsatisfiedCount++;
          }
          if (c.matchType === "exclude" && overlap) {
            score += 100;
            unsatisfiedCount++;
          }
        }
      } else if (c.type === "group-match") {
        let isSatisfied = true;
        for (const groupId of c.groupIds) {
          let count = 0;
          studentToSeat.forEach((seat, studentId) => {
            const sg = seatGroupMap.get(seat.id)!;
            if (sg.has(groupId)) {
              const stu = studentMap.get(studentId)!;
              if (c.targetType === "gender" && stu.gender === c.targetId) {
                count++;
              } else if (
                c.targetType === "role" &&
                stu.roleIds.includes(c.targetId)
              ) {
                count++;
              }
            }
          });
          if (count < c.minCount) {
            score += (c.minCount - count) * 100;
            isSatisfied = false;
          }
        }
        if (!isSatisfied) unsatisfiedCount++;
      }
    }
    return { score, unsatisfiedCount };
  };

  let current = calculateScore(currentAssignment);

  const startTime = performance.now();

  for (let iter = 0; iter < SHUFFLE_MAX_SWAPS; iter++) {
    if (current.score === 0) break;
    if (performance.now() - startTime > SHUFFLE_TIME_BUDGET_MS) break;

    const idx1 = Math.floor(Math.random() * currentAssignment.length);
    const idx2 = Math.floor(Math.random() * currentAssignment.length);
    if (idx1 === idx2) continue;

    const newAssignment = [...currentAssignment];
    [newAssignment[idx1], newAssignment[idx2]] = [
      newAssignment[idx2],
      newAssignment[idx1],
    ];

    const next = calculateScore(newAssignment);

    if (next.score <= current.score) {
      currentAssignment = newAssignment;
      current = next;
    } else {
      if (Math.random() < SHUFFLE_ACCEPT_WORSE_RATE) {
        currentAssignment = newAssignment;
        current = next;
      }
    }
  }

  const newSeats = seats.map((s) => {
    if (s.isLocked) return s;
    const idx = availableSeats.findIndex((avail) => avail.id === s.id);
    return { ...s, studentId: currentAssignment[idx] };
  });

  return { newSeats, unsatisfiedCount: current.unsatisfiedCount };
};
