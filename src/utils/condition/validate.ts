import { Student, Seat, Group, Role, Condition } from "../../types";

// 条件検証結果
export interface ConditionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 生徒-グループ条件の検証
export const validateStudentGroupCondition = (
  condition: Extract<Condition, { type: "student-group" }>,
  students: Student[],
  groups: Group[],
  seats: Seat[],
): ConditionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const studentId of condition.studentIds) {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      errors.push(`対象生徒「${studentId}」が見つかりません`);
    }
  }

  for (const groupId of condition.groupIds) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      errors.push(`対象グループ「${groupId}」が見つかりません`);
    }
  }

  const availableSeatsInGroups = seats.filter(
    (seat) =>
      !seat.isEmpty &&
      seat.groupIds.some((gid) => condition.groupIds.includes(gid)),
  );

  if (availableSeatsInGroups.length === 0) {
    errors.push(`対象グループに利用可能な席がありません`);
  } else if (availableSeatsInGroups.length < condition.studentIds.length) {
    warnings.push(
      `対象グループの利用可能席数（${availableSeatsInGroups.length}席）が対象生徒数（${condition.studentIds.length}人）より少ないです`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// ロール-グループ条件の検証
export const validateRoleGroupCondition = (
  condition: Extract<Condition, { type: "role-group" }>,
  students: Student[],
  groups: Group[],
  roles: Role[],
  seats: Seat[],
): ConditionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  let targetStudents: Student[] = [];
  let filterName = "";

  if (condition.roleId) {
    const role = roles.find((r) => r.id === condition.roleId);
    if (!role) {
      errors.push(`対象ロール「${condition.roleId}」が見つかりません`);
    }
    targetStudents = students.filter(
      (s) => condition.roleId && s.roleIds.includes(condition.roleId),
    );
    filterName = role?.name || condition.roleId;

    if (targetStudents.length === 0) {
      errors.push(`対象ロール「${filterName}」を持つ生徒がいません`);
    }
  } else if (condition.gender) {
    const genderLabels = { male: "男性", female: "女性", other: "その他" };
    filterName = genderLabels[condition.gender];
    targetStudents = students.filter((s) => s.gender === condition.gender);

    if (targetStudents.length === 0) {
      errors.push(`${filterName}の生徒がいません`);
    }
  } else {
    errors.push(`ロールまたは性別のいずれかを指定してください`);
  }

  for (const groupId of condition.groupIds) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      errors.push(`対象グループ「${groupId}」が見つかりません`);
    }
  }

  for (const groupId of condition.groupIds) {
    const groupSeats = seats.filter(
      (seat) => !seat.isEmpty && seat.groupIds.includes(groupId),
    );

    if (groupSeats.length < condition.count) {
      const groupName = groups.find((g) => g.id === groupId)?.name || groupId;
      errors.push(
        `グループ「${groupName}」の席数（${groupSeats.length}席）が配置人数（${condition.count}人）より少ないです`,
      );
    }
  }

  const totalRequiredCount = condition.groupIds.length * condition.count;
  if (targetStudents.length < totalRequiredCount) {
    warnings.push(
      `${filterName}の生徒数（${targetStudents.length}人）が全体の必要人数（${totalRequiredCount}人）より少ないです`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// 生徒間距離条件の検証
export const validateStudentDistanceCondition = (
  condition: Extract<Condition, { type: "student-distance" }>,
  students: Student[],
  seats: Seat[],
): ConditionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const student1 = students.find((s) => s.id === condition.studentId1);
  const student2 = students.find((s) => s.id === condition.studentId2);

  if (!student1) {
    errors.push(`対象生徒1「${condition.studentId1}」が見つかりません`);
  }
  if (!student2) {
    errors.push(`対象生徒2「${condition.studentId2}」が見つかりません`);
  }

  if (condition.studentId1 === condition.studentId2) {
    errors.push(`同じ生徒が指定されています`);
  }

  const availableSeats = seats.filter((seat) => !seat.isEmpty);
  if (availableSeats.length < 2) {
    errors.push(`利用可能な席が2席以上ありません`);
  }

  if (condition.shouldBeClose && availableSeats.length >= 2) {
    const hasAdjacentSeats = availableSeats.some((seat1) =>
      availableSeats.some(
        (seat2) =>
          seat1.id !== seat2.id &&
          ((Math.abs(seat1.col - seat2.col) === 1 && seat1.row === seat2.row) ||
            (Math.abs(seat1.row - seat2.row) === 1 && seat1.col === seat2.col)),
      ),
    );

    if (!hasAdjacentSeats) {
      warnings.push(
        `隣接する席が存在しないため、近くに配置する条件を満たせない可能性があります`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// 全ての条件を検証
export const validateAllConditions = (
  conditions: Condition[],
  students: Student[],
  groups: Group[],
  roles: Role[],
  seats: Seat[],
): ConditionValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  const enabledConditions = conditions.filter((c) => c.enabled);

  for (const condition of enabledConditions) {
    let result: ConditionValidationResult;

    switch (condition.type) {
      case "student-group":
        result = validateStudentGroupCondition(
          condition,
          students,
          groups,
          seats,
        );
        break;
      case "role-group":
        result = validateRoleGroupCondition(
          condition,
          students,
          groups,
          roles,
          seats,
        );
        break;
      case "student-distance":
        result = validateStudentDistanceCondition(condition, students, seats);
        break;
      default:
        result = {
          isValid: true,
          errors: [],
          warnings: [],
        };
    }

    allErrors.push(
      ...result.errors.map((error) => `「${condition.name}」: ${error}`),
    );
    allWarnings.push(
      ...result.warnings.map((warning) => `「${condition.name}」: ${warning}`),
    );
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

// 条件の競合チェック
export const checkConditionConflicts = (
  conditions: Condition[],
  students: Student[],
  groups: Group[],
  roles: Role[],
): ConditionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const enabledConditions = conditions.filter((c) => c.enabled);

  const studentGroupConditions = enabledConditions.filter(
    (c): c is Extract<Condition, { type: "student-group" }> =>
      c.type === "student-group",
  );

  for (let i = 0; i < studentGroupConditions.length; i++) {
    for (let j = i + 1; j < studentGroupConditions.length; j++) {
      const condition1 = studentGroupConditions[i];
      const condition2 = studentGroupConditions[j];

      const commonStudents = condition1.studentIds.filter((id) =>
        condition2.studentIds.includes(id),
      );
      const commonGroups = condition1.groupIds.filter((id) =>
        condition2.groupIds.includes(id),
      );

      if (commonStudents.length > 0 && commonGroups.length > 0) {
        if (condition1.shouldPlace !== condition2.shouldPlace) {
          const studentNames = commonStudents
            .map((id) => students.find((s) => s.id === id)?.name || id)
            .join(", ");
          const groupNames = commonGroups
            .map((id) => groups.find((g) => g.id === id)?.name || id)
            .join(", ");
          errors.push(
            `生徒「${studentNames}」に対してグループ「${groupNames}」の配置条件が矛盾しています（「${condition1.name}」と「${condition2.name}」）`,
          );
        }
      }
    }
  }

  const roleGroupConditions = enabledConditions.filter(
    (c): c is Extract<Condition, { type: "role-group" }> =>
      c.type === "role-group",
  );

  for (let i = 0; i < roleGroupConditions.length; i++) {
    for (let j = i + 1; j < roleGroupConditions.length; j++) {
      const condition1 = roleGroupConditions[i];
      const condition2 = roleGroupConditions[j];

      if (condition1.roleId === condition2.roleId) {
        const commonGroups = condition1.groupIds.filter((id) =>
          condition2.groupIds.includes(id),
        );

        if (commonGroups.length > 0) {
          const roleName =
            roles.find((r) => r.id === condition1.roleId)?.name ||
            condition1.roleId;
          const groupNames = commonGroups
            .map((id) => groups.find((g) => g.id === id)?.name || id)
            .join(", ");
          warnings.push(
            `ロール「${roleName}」のグループ「${groupNames}」への配置人数が重複しています（「${condition1.name}」: ${condition1.count}人、「${condition2.name}」: ${condition2.count}人）`,
          );
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
