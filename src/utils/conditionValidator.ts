import { 
  Student, 
  Seat, 
  Group, 
  Role,
  StudentGroupCondition, 
  RoleGroupCondition, 
  StudentDistanceCondition,
  Condition
} from '../types';

// 条件検証結果
export interface ConditionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 生徒-グループ条件の検証
export const validateStudentGroupCondition = (
  condition: StudentGroupCondition,
  students: Student[],
  groups: Group[],
  seats: Seat[]
): ConditionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 対象生徒の存在チェック
  for (const studentId of condition.studentIds) {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      errors.push(`対象生徒「${studentId}」が見つかりません`);
    }
  }

  // 対象グループの存在チェック
  for (const groupId of condition.groupIds) {
    const group = groups.find(g => g.id === groupId);
    if (!group) {
      errors.push(`対象グループ「${groupId}」が見つかりません`);
    }
  }

  // 対象グループに席が存在するかチェック
  const availableSeatsInGroups = seats.filter(seat => 
    !seat.isEmpty && seat.groupIds.some(gid => condition.groupIds.includes(gid))
  );

  if (availableSeatsInGroups.length === 0) {
    errors.push(`対象グループに利用可能な席がありません`);
  } else if (availableSeatsInGroups.length < condition.studentIds.length) {
    warnings.push(`対象グループの利用可能席数（${availableSeatsInGroups.length}席）が対象生徒数（${condition.studentIds.length}人）より少ないです`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ロール-グループ条件の検証
export const validateRoleGroupCondition = (
  condition: RoleGroupCondition,
  students: Student[],
  groups: Group[],
  roles: Role[],
  seats: Seat[]
): ConditionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 対象ロールの存在チェック
  const role = roles.find(r => r.id === condition.roleId);
  if (!role) {
    errors.push(`対象ロール「${condition.roleId}」が見つかりません`);
  }

  // 対象グループの存在チェック
  for (const groupId of condition.groupIds) {
    const group = groups.find(g => g.id === groupId);
    if (!group) {
      errors.push(`対象グループ「${groupId}」が見つかりません`);
    }
  }

  // 対象ロールを持つ生徒の存在チェック
  const studentsWithRole = students.filter(s => s.roleIds.includes(condition.roleId));
  if (studentsWithRole.length === 0) {
    errors.push(`対象ロール「${role?.name || condition.roleId}」を持つ生徒がいません`);
  }

  // 各グループの席数と配置人数のチェック
  for (const groupId of condition.groupIds) {
    const groupSeats = seats.filter(seat => 
      !seat.isEmpty && seat.groupIds.includes(groupId)
    );
    
    if (groupSeats.length < condition.count) {
      const groupName = groups.find(g => g.id === groupId)?.name || groupId;
      errors.push(`グループ「${groupName}」の席数（${groupSeats.length}席）が配置人数（${condition.count}人）より少ないです`);
    }
  }

  // 全体の配置人数チェック
  const totalRequiredCount = condition.groupIds.length * condition.count;
  if (studentsWithRole.length < totalRequiredCount) {
    warnings.push(`対象ロール「${role?.name || condition.roleId}」を持つ生徒数（${studentsWithRole.length}人）が全体の必要人数（${totalRequiredCount}人）より少ないです`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// 生徒間距離条件の検証
export const validateStudentDistanceCondition = (
  condition: StudentDistanceCondition,
  students: Student[],
  seats: Seat[]
): ConditionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 対象生徒の存在チェック
  const student1 = students.find(s => s.id === condition.studentId1);
  const student2 = students.find(s => s.id === condition.studentId2);

  if (!student1) {
    errors.push(`対象生徒1「${condition.studentId1}」が見つかりません`);
  }
  if (!student2) {
    errors.push(`対象生徒2「${condition.studentId2}」が見つかりません`);
  }

  // 同じ生徒が指定されている場合
  if (condition.studentId1 === condition.studentId2) {
    errors.push(`同じ生徒が指定されています`);
  }

  // 利用可能席数のチェック
  const availableSeats = seats.filter(seat => !seat.isEmpty);
  if (availableSeats.length < 2) {
    errors.push(`利用可能な席が2席以上ありません`);
  }

  // 近くに配置する場合の席配置可能性チェック
  if (condition.shouldBeClose && availableSeats.length >= 2) {
    const hasAdjacentSeats = availableSeats.some(seat1 => 
      availableSeats.some(seat2 => 
        seat1.id !== seat2.id && 
        ((Math.abs(seat1.col - seat2.col) === 1 && seat1.row === seat2.row) ||
         (Math.abs(seat1.row - seat2.row) === 1 && seat1.col === seat2.col))
      )
    );
    
    if (!hasAdjacentSeats) {
      warnings.push(`隣接する席が存在しないため、近くに配置する条件を満たせない可能性があります`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// 全ての条件を検証
export const validateAllConditions = (
  conditions: Condition[],
  students: Student[],
  groups: Group[],
  roles: Role[],
  seats: Seat[]
): ConditionValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // 有効な条件のみを検証
  const enabledConditions = conditions.filter(c => c.enabled);

  for (const condition of enabledConditions) {
    let result: ConditionValidationResult;

    switch (condition.type) {
      case 'student-group':
        result = validateStudentGroupCondition(
          condition as StudentGroupCondition,
          students,
          groups,
          seats
        );
        break;
      case 'role-group':
        result = validateRoleGroupCondition(
          condition as RoleGroupCondition,
          students,
          groups,
          roles,
          seats
        );
        break;
      case 'student-distance':
        result = validateStudentDistanceCondition(
          condition as StudentDistanceCondition,
          students,
          seats
        );
        break;
      default:
        result = {
          isValid: true,
          errors: [],
          warnings: []
        };
    }

    // 条件名を付けてエラー・警告を追加
    allErrors.push(...result.errors.map(error => `「${condition.name}」: ${error}`));
    allWarnings.push(...result.warnings.map(warning => `「${condition.name}」: ${warning}`));
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};

// 条件の競合チェック
export const checkConditionConflicts = (
  conditions: Condition[],
  students: Student[],
  groups: Group[],
  roles: Role[]
): ConditionValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const enabledConditions = conditions.filter(c => c.enabled);

  // 生徒-グループ条件の競合チェック
  const studentGroupConditions = enabledConditions.filter(c => c.type === 'student-group') as StudentGroupCondition[];
  
  for (let i = 0; i < studentGroupConditions.length; i++) {
    for (let j = i + 1; j < studentGroupConditions.length; j++) {
      const condition1 = studentGroupConditions[i];
      const condition2 = studentGroupConditions[j];

      // 同じ生徒に対して矛盾する条件があるかチェック
      const commonStudents = condition1.studentIds.filter(id => condition2.studentIds.includes(id));
      const commonGroups = condition1.groupIds.filter(id => condition2.groupIds.includes(id));

      if (commonStudents.length > 0 && commonGroups.length > 0) {
        if (condition1.shouldPlace !== condition2.shouldPlace) {
          const studentNames = commonStudents.map(id => students.find(s => s.id === id)?.name || id).join(', ');
          const groupNames = commonGroups.map(id => groups.find(g => g.id === id)?.name || id).join(', ');
          errors.push(`生徒「${studentNames}」に対してグループ「${groupNames}」の配置条件が矛盾しています（「${condition1.name}」と「${condition2.name}」）`);
        }
      }
    }
  }

  // ロール-グループ条件の競合チェック
  const roleGroupConditions = enabledConditions.filter(c => c.type === 'role-group') as RoleGroupCondition[];
  
  for (let i = 0; i < roleGroupConditions.length; i++) {
    for (let j = i + 1; j < roleGroupConditions.length; j++) {
      const condition1 = roleGroupConditions[i];
      const condition2 = roleGroupConditions[j];

      // 同じロールとグループの組み合わせで矛盾する条件があるかチェック
      if (condition1.roleId === condition2.roleId) {
        const commonGroups = condition1.groupIds.filter(id => condition2.groupIds.includes(id));
        
        if (commonGroups.length > 0) {
          const roleName = roles.find(r => r.id === condition1.roleId)?.name || condition1.roleId;
          const groupNames = commonGroups.map(id => groups.find(g => g.id === id)?.name || id).join(', ');
          warnings.push(`ロール「${roleName}」のグループ「${groupNames}」への配置人数が重複しています（「${condition1.name}」: ${condition1.count}人、「${condition2.name}」: ${condition2.count}人）`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
