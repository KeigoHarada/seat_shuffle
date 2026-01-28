// グループの型定義
export type Group = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

// ロールの型定義
export type Role = {
  id: string;
  name: string;
  icon: string;
  description?: string;
};

// 条件の共通プロパティ
interface BaseCondition {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
}

// 判別可能なユニオン型として条件を定義
export type Condition =
  | (BaseCondition & {
      type: "student-group";
      studentIds: string[];
      groupIds: string[];
      shouldPlace: boolean; // true: 配置する, false: 配置しない
    })
  | (BaseCondition & {
      type: "role-group";
      roleId?: string;
      gender?: "male" | "female" | "other";
      groupIds: string[];
      count: number; // 配置する人数
    })
  | (BaseCondition & {
      type: "student-distance";
      studentId1: string;
      studentId2: string;
      shouldBeClose: boolean; // true: 近くに配置, false: 遠くに配置
    });

// 席の型定義
export type Seat = {
  id: string;
  row: number;
  col: number;
  studentId?: string;
  isEmpty: boolean;
  groupIds: string[];
};

// 生徒の型定義
export type Student = {
  id: string;
  name: string;
  furigana: string;
  gender: "male" | "female" | "other";
  studentNumber: number;
  roleIds: string[];
};

// 席配置の型定義
export type SeatLayout = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  seats: Seat[];
  teacherDeskPosition: "top" | "bottom";
};

// 条件チェック結果の詳細情報
export type ConditionCheckResult = {
  condition: Condition;
  satisfied: boolean;
  reason?: string;
};

// 配置結果の詳細分析
export type AssignmentAnalysis = {
  totalConditions: number;
  failedConditions: ConditionCheckResult[];
  assignment: { [seatId: string]: string };
};

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
