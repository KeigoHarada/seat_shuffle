import { 
  ShuffleAlgorithm, 
  ShuffleResult, 
  ShuffleManagerConfig 
} from '../types/shuffle';
import { Seat, Student, Group, Role, Condition } from '../types';

export class ShuffleManager {
  private config: ShuffleManagerConfig;
  private currentAlgorithm: ShuffleAlgorithm;

  constructor(config: ShuffleManagerConfig) {
    this.config = config;
    this.currentAlgorithm = config.algorithms[config.defaultAlgorithm];
  }

  // アルゴリズムを変更
  setAlgorithm(algorithmName: string): boolean {
    const algorithm = this.config.algorithms[algorithmName];
    if (!algorithm) {
      console.warn(`アルゴリズム '${algorithmName}' が見つかりません`);
      return false;
    }
    this.currentAlgorithm = algorithm;
    return true;
  }

  // 現在のアルゴリズムを取得
  getCurrentAlgorithm(): ShuffleAlgorithm {
    return this.currentAlgorithm;
  }

  // 利用可能なアルゴリズム一覧を取得
  getAvailableAlgorithms(): { name: string; description: string }[] {
    return Object.values(this.config.algorithms).map(alg => ({
      name: alg.name,
      description: alg.description
    }));
  }

  // シャッフル実行
  async shuffle(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
    groups: Group[],
    roles: Role[]
  ): Promise<ShuffleResult> {
    // アルゴリズムの有効性をチェック
    if (this.currentAlgorithm.canHandle && 
        !this.currentAlgorithm.canHandle(students, seats)) {
      return {
        success: false,
        assignment: {},
        error: '現在のアルゴリズムではこのデータを処理できません'
      };
    }

    // タイムアウト付きでシャッフル実行
    const timeoutPromise = new Promise<ShuffleResult>((_, reject) => {
      setTimeout(() => {
        reject(new Error('シャッフルがタイムアウトしました'));
      }, this.config.timeout);
    });

    try {
      const result = await Promise.race([
        this.currentAlgorithm.shuffle(students, seats, conditions, groups, roles),
        timeoutPromise
      ]);

      return result;
    } catch (error) {
      return {
        success: false,
        assignment: {},
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      };
    }
  }

  // アルゴリズムの設定を更新
  configureAlgorithm(options: Record<string, any>): void {
    if (this.currentAlgorithm.configure) {
      this.currentAlgorithm.configure(options);
    }
  }

  // 設定を更新
  updateConfig(newConfig: Partial<ShuffleManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
