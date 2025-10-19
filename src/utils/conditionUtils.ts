import { 
  Seat, 
  Student, 
  Group, 
  Role,
  StudentGroupCondition, 
  RoleGroupCondition, 
  StudentDistanceCondition,
  Condition
} from '../types';

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

// 生徒-グループ条件をチェック
export const checkStudentGroupCondition = (
  condition: StudentGroupCondition,
  student: Student,
  seat: Seat,
  groups: Group[]
): boolean => {
  // 条件が無効な場合は常にtrue
  if (!condition.enabled) return true;
  
  // 対象生徒でない場合は常にtrue
  if (!condition.studentIds.includes(student.id)) return true;
  
  // 対象グループでない場合は常にtrue（いずれかのグループが含まれているかチェック）
  const hasTargetGroup = seat.groupIds.some(gid => condition.groupIds.includes(gid));
  if (!hasTargetGroup) return true;
  
  // 配置する/しないの条件をチェック
  return condition.shouldPlace;
};

// ロール-グループ条件をチェック
export const checkRoleGroupCondition = (
  condition: RoleGroupCondition,
  student: Student,
  seat: Seat,
  groups: Group[],
  students: Student[],
  currentAssignments: { [seatId: string]: string }
): boolean => {
  // 条件が無効な場合は常にtrue
  if (!condition.enabled) return true;
  
  // ロールまたは性別でフィルタリング
  if (condition.roleId) {
    // ロールでフィルタリング
    if (!student.roleIds.includes(condition.roleId)) return true;
  } else if (condition.gender) {
    // 性別でフィルタリング
    if (student.gender !== condition.gender) return true;
  } else {
    // ロールも性別も指定されていない場合は常にtrue
    return true;
  }
  
  // 対象グループでない場合は常にtrue（いずれかのグループが含まれているかチェック）
  const hasTargetGroup = seat.groupIds.some(gid => condition.groupIds.includes(gid));
  if (!hasTargetGroup) return true;
  
  // この席のグループのうち、条件に含まれるグループそれぞれで人数制限をチェック
  // 少なくとも1つのグループで制限内であればOK
  const relevantGroupIds = seat.groupIds.filter(gid => condition.groupIds.includes(gid));
  
  for (const groupId of relevantGroupIds) {
    const currentRoleCount = Object.entries(currentAssignments).filter(([seatId, assignedStudentId]) => {
      const assignedSeat = Object.values(currentAssignments);
      
      const assignedStudent = students.find(s => s.id === assignedStudentId);
      if (!assignedStudent) return false;
      
      // ロールまたは性別でチェック
      if (condition.roleId) {
        return assignedStudent.roleIds.includes(condition.roleId);
      } else if (condition.gender) {
        return assignedStudent.gender === condition.gender;
      }
      return false;
    }).length;
    
    // 1つでも制限内のグループがあればOK
    if (currentRoleCount < condition.count) {
      return true;
    }
  }
  
  // すべてのグループで制限を超えている
  return false;
};

// 生徒間距離条件をチェック
export const checkStudentDistanceCondition = (
  condition: StudentDistanceCondition,
  student: Student,
  seat: Seat,
  currentAssignments: { [seatId: string]: string },
  allSeats: Seat[]
): boolean => {
  // 条件が無効な場合は常にtrue
  if (!condition.enabled) return true;
  
  // 対象生徒でない場合は常にtrue
  if (student.id !== condition.studentId1 && student.id !== condition.studentId2) return true;
  
  // もう一方の生徒が既に配置されているかチェック
  const otherStudentId = student.id === condition.studentId1 ? condition.studentId2 : condition.studentId1;
  const otherStudentSeatId = Object.keys(currentAssignments).find(seatId => 
    currentAssignments[seatId] === otherStudentId
  );
  
  if (!otherStudentSeatId) return true; // もう一方の生徒が未配置の場合はOK
  
  // もう一方の生徒の席を取得
  const otherStudentSeat = allSeats.find(s => s.id === otherStudentSeatId);
  if (!otherStudentSeat) return true;
  
  // 距離を計算
  const distance = calculateDistance(seat, otherStudentSeat);
  
  if (condition.shouldBeClose) {
    // 近くに配置する場合：隣接席または距離2以内
    return distance <= 2;
  } else {
    // 遠くに配置する場合：距離3以上
    return distance >= 3;
  }
};

// 全ての条件をチェック
export const checkAllConditions = (
  student: Student,
  seat: Seat,
  conditions: Condition[],
  groups: Group[],
  roles: Role[],
  students: Student[],
  currentAssignments: { [seatId: string]: string },
  allSeats: Seat[]
): boolean => {
  return conditions.every(condition => {
    switch (condition.type) {
      case 'student-group':
        return checkStudentGroupCondition(condition as StudentGroupCondition, student, seat, groups);
      case 'role-group':
        return checkRoleGroupCondition(condition as RoleGroupCondition, student, seat, groups, students, currentAssignments);
      case 'student-distance':
        return checkStudentDistanceCondition(condition as StudentDistanceCondition, student, seat, currentAssignments, allSeats);
      default:
        return true;
    }
  });
};

// 条件を満たす席配置を生成
export const generateConditionalSeatAssignment = (
  students: Student[],
  seats: Seat[],
  conditions: Condition[],
  groups: Group[],
  roles: Role[],
  maxAttempts: number = 1000
): { [seatId: string]: string } | null => {
  const availableSeats = seats.filter(seat => !seat.isEmpty);
  const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
  
  // 生徒数と席数が合わない場合はnullを返す
  if (shuffledStudents.length > availableSeats.length) {
    return null;
  }
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const assignments: { [seatId: string]: string } = {};
    const remainingStudents = [...shuffledStudents];
    const remainingSeats = [...availableSeats];
    
    let success = true;
    
    // 各生徒に対して条件を満たす席を探す
    for (const student of remainingStudents) {
      const validSeats = remainingSeats.filter(seat => 
        checkAllConditions(student, seat, conditions, groups, roles, students, assignments, seats)
      );
      
      if (validSeats.length === 0) {
        success = false;
        break;
      }
      
      // ランダムに席を選択
      const selectedSeat = validSeats[Math.floor(Math.random() * validSeats.length)];
      assignments[selectedSeat.id] = student.id;
      
      // 使用した席を残りリストから削除
      const seatIndex = remainingSeats.indexOf(selectedSeat);
      remainingSeats.splice(seatIndex, 1);
    }
    
    if (success) {
      return assignments;
    }
  }
  
  return null; // 条件を満たす配置が見つからない
};

// 条件チェック結果の詳細情報
export interface ConditionCheckResult {
  condition: Condition;
  satisfied: boolean;
  reason?: string;
}

// 配置結果の詳細分析
export interface AssignmentAnalysis {
  totalConditions: number;
  satisfiedConditions: number;
  failedConditions: ConditionCheckResult[];
  assignment: { [seatId: string]: string };
}

// 条件を満たす席配置を生成（詳細分析付き）
export const generateConditionalSeatAssignmentWithAnalysis = (
  students: Student[],
  seats: Seat[],
  conditions: Condition[],
  groups: Group[],
  roles: Role[],
  maxAttempts: number = 1000
): AssignmentAnalysis | null => {
  const availableSeats = seats.filter(seat => !seat.isEmpty);
  const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
  
  // 生徒数と席数が合わない場合はnullを返す
  if (shuffledStudents.length > availableSeats.length) {
    return null;
  }
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const assignments: { [seatId: string]: string } = {};
    const remainingStudents = [...shuffledStudents];
    const remainingSeats = [...availableSeats];
    
    let success = true;
    
    // 各生徒に対して条件を満たす席を探す
    for (const student of remainingStudents) {
      const validSeats = remainingSeats.filter(seat => 
        checkAllConditions(student, seat, conditions, groups, roles, students, assignments, seats)
      );
      
      if (validSeats.length === 0) {
        success = false;
        break;
      }
      
      // ランダムに席を選択
      const selectedSeat = validSeats[Math.floor(Math.random() * validSeats.length)];
      assignments[selectedSeat.id] = student.id;
      
      // 使用した席を残りリストから削除
      const seatIndex = remainingSeats.indexOf(selectedSeat);
      remainingSeats.splice(seatIndex, 1);
    }
    
    if (success) {
      // 配置結果を分析
      const analysis = analyzeAssignment(assignments, conditions, students, seats, groups, roles);
      return analysis;
    }
  }
  
  return null; // 条件を満たす配置が見つからない
};

// 配置結果を分析
export const analyzeAssignment = (
  assignments: { [seatId: string]: string },
  conditions: Condition[],
  students: Student[],
  seats: Seat[],
  groups: Group[],
  roles: Role[]
): AssignmentAnalysis => {
  const failedConditions: ConditionCheckResult[] = [];
  
  // 各条件をチェック
  for (const condition of conditions) {
    if (!condition.enabled) continue;
    
    let satisfied = true;
    let reason = '';
    
    switch (condition.type) {
      case 'student-group':
        const studentGroupCondition = condition as StudentGroupCondition;
        for (const studentId of studentGroupCondition.studentIds) {
          const assignedSeatId = Object.keys(assignments).find(seatId => assignments[seatId] === studentId);
          if (!assignedSeatId) continue;
          
          const seat = seats.find(s => s.id === assignedSeatId);
          if (!seat) continue;
          
          const hasTargetGroup = seat.groupIds.some(gid => studentGroupCondition.groupIds.includes(gid));
          if (studentGroupCondition.shouldPlace && !hasTargetGroup) {
            satisfied = false;
            reason = `${students.find(s => s.id === studentId)?.name}が対象グループに配置されていません`;
            break;
          } else if (!studentGroupCondition.shouldPlace && hasTargetGroup) {
            satisfied = false;
            reason = `${students.find(s => s.id === studentId)?.name}が対象グループに配置されています`;
            break;
          }
        }
        break;
        
      case 'role-group':
        const roleGroupCondition = condition as RoleGroupCondition;
        for (const groupId of roleGroupCondition.groupIds) {
          const groupSeats = seats.filter(s => s.groupIds.includes(groupId));
          const roleStudentsInGroup = groupSeats.filter(seat => {
            const studentId = assignments[seat.id];
            if (!studentId) return false;
            const student = students.find(s => s.id === studentId);
            return student && roleGroupCondition.roleId && student.roleIds.includes(roleGroupCondition.roleId);
          }).length;
          
          if (roleStudentsInGroup !== roleGroupCondition.count) {
            satisfied = false;
            reason = `${roles.find(r => r.id === roleGroupCondition.roleId)?.name || 'ロール'}が${groups.find(g => g.id === groupId)?.name || 'グループ'}に${roleGroupCondition.count}人配置されていません（実際: ${roleStudentsInGroup}人）`;
            break;
          }
        }
        break;
        
      case 'student-distance':
        const studentDistanceCondition = condition as StudentDistanceCondition;
        const student1SeatId = Object.keys(assignments).find(seatId => assignments[seatId] === studentDistanceCondition.studentId1);
        const student2SeatId = Object.keys(assignments).find(seatId => assignments[seatId] === studentDistanceCondition.studentId2);
        
        if (student1SeatId && student2SeatId) {
          const seat1 = seats.find(s => s.id === student1SeatId);
          const seat2 = seats.find(s => s.id === student2SeatId);
          
          if (seat1 && seat2) {
            const distance = calculateDistance(seat1, seat2);
            const student1Name = students.find(s => s.id === studentDistanceCondition.studentId1)?.name;
            const student2Name = students.find(s => s.id === studentDistanceCondition.studentId2)?.name;
            
            if (studentDistanceCondition.shouldBeClose && distance > 2) {
              satisfied = false;
              reason = `${student1Name}と${student2Name}が近くに配置されていません（距離: ${distance.toFixed(1)}）`;
            } else if (!studentDistanceCondition.shouldBeClose && distance < 3) {
              satisfied = false;
              reason = `${student1Name}と${student2Name}が遠くに配置されていません（距離: ${distance.toFixed(1)}）`;
            }
          }
        }
        break;
    }
    
    if (!satisfied) {
      failedConditions.push({
        condition,
        satisfied: false,
        reason
      });
    }
  }
  
  return {
    totalConditions: conditions.filter(c => c.enabled).length,
    satisfiedConditions: conditions.filter(c => c.enabled).length - failedConditions.length,
    failedConditions,
    assignment: assignments
  };
};
