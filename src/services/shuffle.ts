import type { Seat } from "../types/seat";
import type { Student } from "../types/student";
import type { Constraint } from "../types/constraint";

const SHUFFLE_MAX_SWAPS = 50000;
const SHUFFLE_TIME_BUDGET_MS = 300;
const SHUFFLE_ACCEPT_WORSE_RATE = 0.01;

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
