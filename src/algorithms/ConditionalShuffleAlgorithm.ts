import { ShuffleAlgorithm, ShuffleResult, ShuffleAnalysis } from '../types/shuffle';
import { Seat, Student, Group, Role, Condition } from '../types';
import { generateConditionalSeatAssignmentWithAnalysis } from '../utils/conditionUtils';

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
            satisfiedConditions: 0,
            failedConditions: 0,
            conditionDetails: []
          }
        };
      }

      // 条件を考慮した席配置を生成
      const analysis = generateConditionalSeatAssignmentWithAnalysis(
        students,
        seats,
        enabledConditions,
        groups,
        roles
      );

      if (!analysis) {
        return {
          success: false,
          assignment: {},
          error: '条件を満たす席配置が見つかりませんでした'
        };
      }

      // 分析結果をShuffleAnalysis形式に変換
      const shuffleAnalysis: ShuffleAnalysis = {
        totalConditions: analysis.totalConditions,
        satisfiedConditions: analysis.satisfiedConditions,
        failedConditions: analysis.failedConditions,
        conditionDetails: enabledConditions.map(condition => ({
          conditionId: condition.id,
          conditionName: condition.name || '無名の条件',
          satisfied: analysis.satisfiedConditions > 0,
          reason: analysis.satisfiedConditions > 0 ? '条件を満たしています' : '条件を満たしていません'
        }))
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
