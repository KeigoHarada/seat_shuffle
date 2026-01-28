import { Seat, Student, Condition, ConditionCheckResult } from "../../types";
import { CONDITION_CONSTANTS } from "../../constants/condition";

// 席の座標から距離を計算
export const calculateDistance = (seat1: Seat, seat2: Seat): number => {
  const dx = Math.abs(seat1.col - seat2.col);
  const dy = Math.abs(seat1.row - seat2.row);
  return Math.sqrt(dx * dx + dy * dy);
};

// 隣接席かどうかを判定（前後左右のみ）
export const isAdjacent = (seat1: Seat, seat2: Seat): boolean => {
  const dx = Math.abs(seat1.col - seat2.col);
  const dy = Math.abs(seat1.row - seat2.row);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

// 生徒間距離条件をチェック（分析用）
export const checkStudentDistanceCondition = (
  condition: Extract<Condition, { type: "student-distance" }>,
  assignments: { [seatId: string]: string },
  students: Student[],
  seats: Seat[],
): ConditionCheckResult => {
  const student1SeatId = Object.keys(assignments).find(
    (seatId) => assignments[seatId] === condition.studentId1,
  );
  const student2SeatId = Object.keys(assignments).find(
    (seatId) => assignments[seatId] === condition.studentId2,
  );

  if (!student1SeatId || !student2SeatId) {
    return { condition, satisfied: true };
  }

  const seat1 = seats.find((s) => s.id === student1SeatId);
  const seat2 = seats.find((s) => s.id === student2SeatId);

  if (!seat1 || !seat2) {
    return { condition, satisfied: true };
  }

  const distance = calculateDistance(seat1, seat2);
  const student1Name = students.find(
    (s) => s.id === condition.studentId1,
  )?.name;
  const student2Name = students.find(
    (s) => s.id === condition.studentId2,
  )?.name;

  if (
    condition.shouldBeClose &&
    distance > CONDITION_CONSTANTS.DISTANCE.CLOSE_THRESHOLD
  ) {
    return {
      condition,
      satisfied: false,
      reason: `${student1Name}と${student2Name}が近くに配置されていません（距離: ${distance.toFixed(1)}）`,
    };
  }

  if (
    !condition.shouldBeClose &&
    distance < CONDITION_CONSTANTS.DISTANCE.FAR_THRESHOLD
  ) {
    return {
      condition,
      satisfied: false,
      reason: `${student1Name}と${student2Name}が遠くに配置されていません（距離: ${distance.toFixed(1)}）`,
    };
  }

  return { condition, satisfied: true };
};
