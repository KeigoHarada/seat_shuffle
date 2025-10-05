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
  
  // 対象グループでない場合は常にtrue
  if (!condition.groupIds.includes(seat.groupId || '')) return true;
  
  // 配置する/しないの条件をチェック
  return condition.shouldPlace;
};

// ロール-グループ条件をチェック
export const checkRoleGroupCondition = (
  condition: RoleGroupCondition,
  student: Student,
  seat: Seat,
  groups: Group[],
  currentAssignments: { [seatId: string]: string }
): boolean => {
  // 条件が無効な場合は常にtrue
  if (!condition.enabled) return true;
  
  // 対象ロールでない場合は常にtrue
  if (!student.roleIds.includes(condition.roleId)) return true;
  
  // 対象グループでない場合は常にtrue
  if (!condition.groupIds.includes(seat.groupId || '')) return true;
  
  // 既に配置されているロールの人数をカウント
  const currentRoleCount = Object.values(currentAssignments).filter(assignedStudentId => {
    const assignedStudent = groups.find(g => g.id === seat.groupId) ? 
      // ここでは簡略化のため、実際の生徒データが必要
      // 本来は students 配列から該当生徒を探す必要がある
      true : false;
    return assignedStudent;
  }).length;
  
  // 配置人数制限をチェック
  return currentRoleCount < condition.count;
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
        return checkRoleGroupCondition(condition as RoleGroupCondition, student, seat, groups, currentAssignments);
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
