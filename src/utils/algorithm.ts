import { Seat, Student } from "../types";

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
