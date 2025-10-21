import { ShuffleAlgorithm, ShuffleResult, ShuffleAnalysis } from '../types/shuffle';
import { Seat, Student, Group, Role, Condition } from '../types';
import { generateCSPSeatAssignmentWithAnalysis } from '../utils/conditionUtils';

export class ConditionalShuffleAlgorithm implements ShuffleAlgorithm {
  name = 'conditional';
  description = '条件を考慮した高度なシャッフルアルゴリズム';

  async shuffle(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
    groups: Group[],
    roles: Role[]
  ): Promise<ShuffleResult> {
    try {
      // 有効な条件のみを取得
      const enabledConditions = conditions.filter(c => c.enabled);
      
      if (enabledConditions.length === 0) {
        // 条件がない場合は空席のみを除外してランダム配置
        const availableSeats = seats.filter(seat => !seat.isEmpty);
        const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
        
        const assignment: { [seatId: string]: string | undefined } = {};
        
        seats.forEach(seat => {
          if (seat.isEmpty) {
            assignment[seat.id] = undefined;
          } else {
            const studentIndex = availableSeats.indexOf(seat);
            assignment[seat.id] = shuffledStudents[studentIndex]?.id;
          }
        });
        
        return {
          success: true,
          assignment,
        analysis: {
          totalConditions: 0,
          failedConditions: []
        }
        };
      }

      // CSPアルゴリズムで条件を考慮した席配置を生成
      const analysis = generateCSPSeatAssignmentWithAnalysis(
        students,
        seats,
        enabledConditions,
        groups,
        roles,
        1000, // maxAttempts
        10000 // timeoutMs (10秒)
      );

      if (!analysis) {
        return {
          success: false,
          assignment: {},
          error: '制約充足問題として解けませんでした。条件が複雑すぎるか、解が存在しない可能性があります。'
        };
      }

      // 分析結果をShuffleAnalysis形式に変換
      const shuffleAnalysis: ShuffleAnalysis = {
        totalConditions: analysis.totalConditions,
        failedConditions: analysis.failedConditions
      };

      return {
        success: true,
        assignment: analysis.assignment,
        analysis: shuffleAnalysis
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
