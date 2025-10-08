// グループの型定義
export interface Group {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// ロールの型定義
export interface Role {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

// 条件の型定義
export interface Condition {
  id: string;
  name: string;
  type: 'student-group' | 'role-group' | 'student-distance';
  enabled: boolean;
  description?: string;
}

// 生徒-グループ条件
export interface StudentGroupCondition extends Condition {
  type: 'student-group';
  studentIds: string[];
  groupIds: string[];
  shouldPlace: boolean; // true: 配置する, false: 配置しない
}

// ロール-グループ条件
export interface RoleGroupCondition extends Condition {
  type: 'role-group';
  roleId: string;
  groupIds: string[];
  count: number; // 配置する人数
}

// 生徒間距離条件
export interface StudentDistanceCondition extends Condition {
  type: 'student-distance';
  studentId1: string;
  studentId2: string;
  shouldBeClose: boolean; // true: 近くに配置, false: 遠くに配置
}

// 席の型定義
export interface Seat {
  id: string;
  row: number;
  col: number;
  studentId?: string;
  isEmpty: boolean;
  groupIds: string[];
}

// 生徒の型定義
export interface Student {
  id: string;
  name: string;
  studentNumber: number;
  roleIds: string[];
}

// 席配置の型定義
export interface SeatLayout {
  id: string;
  name: string;
  rows: number;
  cols: number;
  seats: Seat[];
}

// アプリケーションの状態型定義
export interface AppState {
  currentLayout: SeatLayout | null;
  students: Student[];
  groups: Group[];
  roles: Role[];
  conditions: Condition[];
  isShuffling: boolean;
  showSettings: boolean;
}
