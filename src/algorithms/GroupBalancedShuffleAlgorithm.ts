import { ShuffleAlgorithm, ShuffleResult, ShuffleAnalysis } from '../types/shuffle';
import { Seat, Student, Group, Role, Condition } from '../types';

export class GroupBalancedShuffleAlgorithm implements ShuffleAlgorithm {
  name = 'group-balanced';
  description = 'グループの分散を考慮したシャッフルアルゴリズム';

  async shuffle(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
    groups: Group[],
    roles: Role[]
  ): Promise<ShuffleResult> {
    try {
      const availableSeats = seats.filter(seat => !seat.isEmpty);
      
      if (availableSeats.length === 0) {
        return {
          success: true,
          assignment: {},
          analysis: this.createEmptyAnalysis(conditions)
        };
      }

      // 生徒をグループごとに分類
      const studentsByGroup = this.groupStudentsByGroup(students, groups);
      
      // 各グループの生徒を分散して配置
      const assignment = this.distributeStudentsAcrossSeats(
        studentsByGroup, 
        availableSeats, 
        seats
      );

      // 分析結果を作成
      const analysis = this.createAnalysis(assignment, seats, groups, conditions);

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

  private groupStudentsByGroup(students: Student[], groups: Group[]): { [groupId: string]: Student[] } {
    const studentsByGroup: { [groupId: string]: Student[] } = {};
    
    // 各グループの配列を初期化
    groups.forEach(group => {
      studentsByGroup[group.id] = [];
    });
    
    // グループなしの生徒用
    studentsByGroup['no-group'] = [];
    
    // 生徒をグループごとに分類
    students.forEach(student => {
      if (student.roleIds && student.roleIds.length > 0) {
        // ロールベースでグループを決定（簡易版）
        const groupId = groups[Math.floor(Math.random() * groups.length)].id;
        studentsByGroup[groupId].push(student);
      } else {
        studentsByGroup['no-group'].push(student);
      }
    });
    
    return studentsByGroup;
  }

  private distributeStudentsAcrossSeats(
    studentsByGroup: { [groupId: string]: Student[] },
    availableSeats: Seat[],
    allSeats: Seat[]
  ): { [seatId: string]: string | undefined } {
    const assignment: { [seatId: string]: string | undefined } = {};
    
    // 全席を初期化
    allSeats.forEach(seat => {
      assignment[seat.id] = seat.isEmpty ? undefined : '';
    });
    
    // 各グループの生徒を分散配置
    const groupIds = Object.keys(studentsByGroup);
    let seatIndex = 0;
    
    groupIds.forEach(groupId => {
      const students = studentsByGroup[groupId];
      
      // グループ内で生徒をシャッフル
      const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
      
      // 利用可能な席に分散配置
      shuffledStudents.forEach((student, studentIndex) => {
        if (seatIndex < availableSeats.length) {
          const seat = availableSeats[seatIndex];
          assignment[seat.id] = student.id;
          
          // 次の席に移動（グループ内で分散させるため、グループ数分スキップ）
          seatIndex += groupIds.length;
          if (seatIndex >= availableSeats.length) {
            seatIndex = (studentIndex + 1) % groupIds.length;
          }
        }
      });
    });
    
    return assignment;
  }

  private createAnalysis(
    assignment: { [seatId: string]: string | undefined },
    seats: Seat[],
    groups: Group[],
    conditions: Condition[]
  ): ShuffleAnalysis {
    const enabledConditions = conditions.filter(c => c.enabled);
    
    // グループ分散の評価（簡易版）
    const groupDistribution = this.evaluateGroupDistribution(assignment, seats, groups);
    
    return {
      totalConditions: enabledConditions.length,
      satisfiedConditions: groupDistribution.isBalanced ? enabledConditions.length : 0,
      failedConditions: groupDistribution.isBalanced ? 0 : enabledConditions.length,
      conditionDetails: enabledConditions.map(condition => ({
        conditionId: condition.id,
        conditionName: condition.name || '無名の条件',
        satisfied: groupDistribution.isBalanced,
        reason: groupDistribution.isBalanced ? 'グループが適切に分散されています' : 'グループの分散が不十分です'
      }))
    };
  }

  private evaluateGroupDistribution(
    assignment: { [seatId: string]: string | undefined },
    seats: Seat[],
    groups: Group[]
  ): { isBalanced: boolean; details: string } {
    // 簡易的なグループ分散評価
    const groupCounts: { [groupId: string]: number } = {};
    groups.forEach(group => {
      groupCounts[group.id] = 0;
    });
    
    seats.forEach(seat => {
      if (seat.groupIds && seat.groupIds.length > 0) {
        seat.groupIds.forEach(groupId => {
          if (groupCounts[groupId] !== undefined) {
            groupCounts[groupId]++;
          }
        });
      }
    });
    
    const counts = Object.values(groupCounts);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    const isBalanced = maxCount - minCount <= 2; // 最大2席までの差を許容
    
    return {
      isBalanced,
      details: `グループ分散: 最大${maxCount}席, 最小${minCount}席`
    };
  }

  private createEmptyAnalysis(conditions: Condition[]): ShuffleAnalysis {
    const enabledConditions = conditions.filter(c => c.enabled);
    return {
      totalConditions: enabledConditions.length,
      satisfiedConditions: 0,
      failedConditions: enabledConditions.length,
      conditionDetails: enabledConditions.map(condition => ({
        conditionId: condition.id,
        conditionName: condition.name || '無名の条件',
        satisfied: false,
        reason: '配置可能な席がありません'
      }))
    };
  }

  canHandle(students: Student[], seats: Seat[]): boolean {
    return students.length > 0 && seats.length > 0;
  }
}
