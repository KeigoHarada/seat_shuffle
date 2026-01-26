import {
  ShuffleAlgorithm,
  ShuffleResult,
  ShuffleAnalysis,
} from "../types/shuffle";
import { Seat, Student, Group, Role, Condition } from "../types";

export class RandomShuffleAlgorithm implements ShuffleAlgorithm {
  name = "random";
  description = "名無し席も含めて全体をランダムシャッフルするアルゴリズム";

  async shuffle(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
    _groups: Group[],
    _roles: Role[],
  ): Promise<ShuffleResult> {
    try {
      // 空席を除外した利用可能な席を取得
      const availableSeats = seats.filter((seat) => !seat.isEmpty);

      // 現在席に割り当てられている生徒IDを取得
      const assignedStudentIds = new Set(
        availableSeats
          .map((seat) => seat.studentId)
          .filter((id): id is string => id !== undefined),
      );

      // 現在割り当てられている生徒だけを抽出
      const assignedStudents = students.filter((s) =>
        assignedStudentIds.has(s.id),
      );

      // 現在の名無し席の数をカウント（空席ではない席で、studentIdがundefinedの席）
      const currentUnnamedCount = availableSeats.filter(
        (seat) => seat.studentId === undefined,
      ).length;

      // 割り当て済み生徒をランダムにシャッフル
      const shuffledStudents = [...assignedStudents].sort(
        () => Math.random() - 0.5,
      );

      // 名無し席用のプレースホルダーを作成（現在の名無し席の数と同じ数）
      const unnamedPlaceholders = Array(currentUnnamedCount).fill("unnamed");

      // 生徒と名無し席を混ぜた配列を作成
      const allSlots: (string | "unnamed")[] = [
        ...shuffledStudents.map((s) => s.id),
        ...unnamedPlaceholders,
      ];

      // 全スロットをランダムにシャッフル
      const shuffledSlots = allSlots.sort(() => Math.random() - 0.5);

      // デバッグ: 数が一致しているか確認
      if (shuffledSlots.length !== availableSeats.length) {
        console.error(
          `[RandomShuffleAlgorithm] スロット数が一致しません: shuffledSlots=${shuffledSlots.length}, availableSeats=${availableSeats.length}, assignedStudents=${assignedStudents.length}, currentUnnamedCount=${currentUnnamedCount}`
        );
      }

      const assignment: { [seatId: string]: string | undefined } = {};

      // 空席はそのまま
      seats.forEach((seat) => {
        if (seat.isEmpty) {
          assignment[seat.id] = undefined;
        }
      });

      // 利用可能な席にスロットをランダムに割り当て
      const shuffledAvailableSeats = [...availableSeats].sort(
        () => Math.random() - 0.5,
      );
      shuffledAvailableSeats.forEach((seat, index) => {
        if (index >= shuffledSlots.length) {
          // スロットが足りない場合は名無し席として扱う
          assignment[seat.id] = undefined;
        } else {
          const slot = shuffledSlots[index];
          assignment[seat.id] = slot === "unnamed" ? undefined : slot;
        }
      });

      // 条件チェック（簡易版）
      const enabledConditions = conditions.filter((c) => c.enabled);
      const analysis: ShuffleAnalysis = {
        totalConditions: enabledConditions.length,
        failedConditions: enabledConditions.map((condition) => ({
          condition,
          satisfied: false,
          reason: "ランダムアルゴリズムでは条件を考慮しません",
        })),
      };

      return {
        success: true,
        assignment,
        analysis,
      };
    } catch (error) {
      return {
        success: false,
        assignment: {},
        error:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
      };
    }
  }

  canHandle(students: Student[], seats: Seat[]): boolean {
    return students.length > 0 && seats.length > 0;
  }
}
