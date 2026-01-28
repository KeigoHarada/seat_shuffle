import { Seat, Student, Condition } from "./index";

// シャッフル結果：席IDと生徒IDのマッピング
export type ShuffleResult = { [seatId: string]: string | undefined };

// シャッフルアルゴリズムのインターフェース
export interface ShuffleAlgorithm {
  name: string;
  description: string;

  // メインのシャッフル実行メソッド
  shuffle(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
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
