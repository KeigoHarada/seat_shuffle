// グループの型定義
export interface Group {
  id: string;
  name: string;
  color: string;
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
  isShuffling: boolean;
  showSettings: boolean;
}
