import {
  Student,
  Seat,
  Group,
  Role,
  Condition,
  ConditionCheckResult,
} from "../../types";

// ロール-グループ条件をチェック（分析用）
export const checkRoleGroupCondition = (
  condition: Extract<Condition, { type: "role-group" }>,
  assignments: { [seatId: string]: string },
  students: Student[],
  seats: Seat[],
  groups: Group[],
  roles: Role[],
): ConditionCheckResult => {
  for (const groupId of condition.groupIds) {
    const groupSeats = seats.filter(
      (s) => s.groupIds.includes(groupId) && !s.isEmpty,
    );
    const roleStudentsInGroup = groupSeats.filter((seat) => {
      const studentId = assignments[seat.id];
      if (!studentId) return false;
      const student = students.find((s) => s.id === studentId);
      if (!student) return false;
      if (condition.roleId) {
        return student.roleIds.includes(condition.roleId);
      }
      if (condition.gender) {
        return student.gender === condition.gender;
      }
      return false;
    }).length;

    if (roleStudentsInGroup !== condition.count) {
      const filterName = condition.roleId
        ? roles.find((r) => r.id === condition.roleId)?.name || "ロール"
        : condition.gender === "male"
          ? "男性"
          : condition.gender === "female"
            ? "女性"
            : "その他";
      return {
        condition,
        satisfied: false,
        reason: `${filterName}が${groups.find((g) => g.id === groupId)?.name || "グループ"}に${condition.count}人配置されていません（実際: ${roleStudentsInGroup}人）`,
      };
    }
  }

  return { condition, satisfied: true };
};
