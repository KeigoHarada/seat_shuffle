import { Student, Seat, Condition, ConditionCheckResult } from "../../types";

// 生徒-グループ条件をチェック（分析用）
export const checkStudentGroupCondition = (
  condition: Extract<Condition, { type: "student-group" }>,
  assignments: { [seatId: string]: string },
  students: Student[],
  seats: Seat[],
): ConditionCheckResult => {
  for (const studentId of condition.studentIds) {
    const assignedSeatId = Object.keys(assignments).find(
      (seatId) => assignments[seatId] === studentId,
    );
    if (!assignedSeatId) continue;

    const seat = seats.find((s) => s.id === assignedSeatId);
    if (!seat) continue;

    const hasTargetGroup = seat.groupIds.some((gid) =>
      condition.groupIds.includes(gid),
    );

    if (condition.shouldPlace && !hasTargetGroup) {
      return {
        condition,
        satisfied: false,
        reason: `${students.find((s) => s.id === studentId)?.name}が対象グループに配置されていません`,
      };
    }

    if (!condition.shouldPlace && hasTargetGroup) {
      return {
        condition,
        satisfied: false,
        reason: `${students.find((s) => s.id === studentId)?.name}が対象グループに配置されています`,
      };
    }
  }

  return { condition, satisfied: true };
};
