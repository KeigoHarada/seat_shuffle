import { ShuffleAlgorithm, ShuffleResult, ShuffleAnalysis } from '../types/shuffle';
import { Seat, Student, Group, Role, Condition } from '../types';

export class RandomShuffleAlgorithm implements ShuffleAlgorithm {
  name = 'random';
  description = '名無し席も含めて全体をランダムシャッフルするアルゴリズム';

  async shuffle(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
    _groups: Group[],
    _roles: Role[]
  ): Promise<ShuffleResult> {
    try {
      // 空席を除外した利用可能な席を取得
      const availableSeats = seats.filter(seat => !seat.isEmpty);
      
      // 現在の名無し席の数をカウント
      const currentUnnamedCount = availableSeats.filter(seat => !('studentId' in seat) || seat.studentId === undefined).length;
      
      // 生徒をランダムにシャッフル
      const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
      
      // 名無し席用のプレースホルダーを作成（現在の名無し席の数と同じ数）
      const unnamedPlaceholders = Array(currentUnnamedCount).fill('unnamed');
      
      // 生徒と名無し席を混ぜた配列を作成
      const allSlots: (string | 'unnamed')[] = [
        ...shuffledStudents.map(s => s.id),
        ...unnamedPlaceholders
      ];
      
      // 全スロットをランダムにシャッフル
      const shuffledSlots = allSlots.sort(() => Math.random() - 0.5);
      
      const assignment: { [seatId: string]: string | undefined } = {};
      
      // 空席はそのまま
      seats.forEach(seat => {
        if (seat.isEmpty) {
          assignment[seat.id] = undefined;
        }
      });
      
      // 利用可能な席にスロットをランダムに割り当て
      const shuffledAvailableSeats = [...availableSeats].sort(() => Math.random() - 0.5);
      shuffledAvailableSeats.forEach((seat, index) => {
        const slot = shuffledSlots[index];
        assignment[seat.id] = slot === 'unnamed' ? undefined : slot;
      });
      

      // 条件チェック（簡易版）
      const enabledConditions = conditions.filter(c => c.enabled);
      const analysis: ShuffleAnalysis = {
        totalConditions: enabledConditions.length,
        failedConditions: enabledConditions.map(condition => ({
          condition,
          satisfied: false,
          reason: 'ランダムアルゴリズムでは条件を考慮しません'
        }))
      };

      return {
        success: true,
        assignment,
        analysis
      };

    } catch (error) {
      return {
        success: false,
        assignment: {},
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      };
    }
  }

  canHandle(students: Student[], seats: Seat[]): boolean {
    return students.length > 0 && seats.length > 0;
  }
}
