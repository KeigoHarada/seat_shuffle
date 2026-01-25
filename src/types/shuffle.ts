import { Seat, Student, Group, Role, Condition } from "./index";

// シャッフル結果のインターフェース
export interface ShuffleResult {
  success: boolean;
  assignment: { [seatId: string]: string | undefined };
  analysis?: ShuffleAnalysis;
  error?: string;
}

// シャッフル分析結果
export interface ShuffleAnalysis {
  totalConditions: number;
  failedConditions: Array<{
    condition: Condition;
    satisfied: boolean;
    reason?: string;
  }>;
}

// シャッフルアルゴリズムのインターフェース
export interface ShuffleAlgorithm {
  name: string;
  description: string;

  // メインのシャッフル実行メソッド
  shuffle(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
    groups: Group[],
    roles: Role[],
  ): Promise<ShuffleResult>;

  // アルゴリズム固有の設定（オプション）
  configure?(options: Record<string, any>): void;

  // アルゴリズムの有効性チェック
  canHandle?(students: Student[], seats: Seat[]): boolean;
}

// シャッフルマネージャーの設定
export interface ShuffleManagerConfig {
  defaultAlgorithm: string;
  algorithms: { [key: string]: ShuffleAlgorithm };
  maxAttempts: number;
  timeout: number;
}
