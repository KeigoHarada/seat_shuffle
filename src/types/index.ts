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

// 席の型定義
export interface Seat {
  id: string;
  row: number;
  col: number;
  studentId?: string;
  isEmpty: boolean;
  groupId?: string;
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
  isShuffling: boolean;
  showSettings: boolean;
}
