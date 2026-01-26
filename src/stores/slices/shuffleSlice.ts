import type { Student, Seat, Condition, Group, Role } from "../../types";
import type { AssignmentAnalysis } from "../../utils/conditionUtils";
import { ShuffleManager } from "../../utils/ShuffleManager";
import { ConditionalShuffleAlgorithm } from "../../algorithms/ConditionalShuffleAlgorithm";
import { RandomShuffleAlgorithm } from "../../algorithms/RandomShuffleAlgorithm";
import {
  SHUFFLE_ANIMATIONS,
  CURRENT_SHUFFLE_ANIMATION,
  type ShuffleAnimation,
} from "../../utils/shuffleAnimations";

type SetState = (partial: unknown) => void;
type GetState = () => unknown;

function createShuffleManager(): ShuffleManager {
  return new ShuffleManager({
    defaultAlgorithm: "conditional",
    algorithms: {
      conditional: new ConditionalShuffleAlgorithm(),
      random: new RandomShuffleAlgorithm(),
    },
    maxAttempts: 1000,
    timeout: 10000,
  });
}

export function createShuffleSlice(set: SetState, get: GetState) {
  const shuffleManager = createShuffleManager();

  let currentAnimation: ShuffleAnimation =
    SHUFFLE_ANIMATIONS[CURRENT_SHUFFLE_ANIMATION] ||
    SHUFFLE_ANIMATIONS["rotate"]!;

  return {
    shuffleManager,

    setShuffleAnimation: (animationName: string) => {
      const animation = SHUFFLE_ANIMATIONS[animationName];
      if (animation) {
        currentAnimation = animation;
      }
    },

    getShuffleAnimation: (): ShuffleAnimation => {
      return currentAnimation;
    },

    shuffleSeats: async () => {
      type ShuffleState = {
        currentLayout: { seats: Seat[] } | null;
        students: Student[];
        conditions: Condition[];
        groups: Group[];
        roles: Role[];
        shuffleManager: ShuffleManager;
      };
      const state = get() as ShuffleState;
      if (!state.currentLayout) return;

      const animation = currentAnimation;
      const startTime = Date.now();
      (window as any).__shuffleStartTime = startTime;
      set({ isShuffling: true });

      try {
        await new Promise((resolve) => setTimeout(resolve, animation.duration));

        const {
          currentLayout,
          students,
          conditions,
          groups,
          roles,
          shuffleManager: manager,
        } = get() as ShuffleState;
        if (!currentLayout) return;

        // 一時的に常にランダムシャッフルを使用
        manager.setAlgorithm("random");

        // 元のコード（条件に応じて切り替え）
        // const enabledConditions = conditions.filter((c) => c.enabled);
        // if (enabledConditions.length === 0) {
        //   manager.setAlgorithm("random");
        // } else {
        //   manager.setAlgorithm("conditional");
        // }

        const beforeAssignment: Record<string, string | undefined> = {};
        for (const seat of currentLayout.seats) {
          beforeAssignment[seat.id] = seat.studentId;
        }

        const formatDisplay = (
          seats: Seat[],
          assignment: Record<string, string | undefined>,
        ): string => {
          const idToName = (id: string) =>
            students.find((s) => s.id === id)?.name ?? "?";
          const lines: string[] = [];
          for (const seat of seats) {
            const v = assignment[seat.id];
            let label: string;
            if (seat.isEmpty) label = "（空席）";
            else if (v === undefined) label = "（名無し）";
            else label = idToName(v);
            lines.push(`  ${seat.id} → ${label}`);
          }
          return lines.join("\n");
        };

        const beforeAssignedStudents = new Set(
          Object.values(beforeAssignment).filter((id) => id !== undefined),
        );
        const beforeUnnamedCount = currentLayout.seats.filter(
          (s) => !s.isEmpty && !s.studentId,
        ).length;
        const beforeEmptyCount = currentLayout.seats.filter(
          (s) => s.isEmpty,
        ).length;

        console.log(
          "\n【シャッフル前】\n" +
            formatDisplay(currentLayout.seats, beforeAssignment),
        );
        console.log(
          `\n【統計】割り当て済み生徒: ${beforeAssignedStudents.size}人, 名無し席: ${beforeUnnamedCount}席, 空席: ${beforeEmptyCount}席, 全生徒数: ${students.length}人`,
        );

        const result = await manager.shuffle(
          students,
          currentLayout.seats,
          conditions,
          groups,
          roles,
        );

        if (result.success) {
          const afterAssignedStudents = new Set(
            Object.values(result.assignment).filter((id) => id !== undefined),
          );
          const afterUnnamedCount = currentLayout.seats.filter(
            (seat) => !seat.isEmpty && result.assignment[seat.id] === undefined,
          ).length;
          const afterEmptyCount = currentLayout.seats.filter(
            (s) => s.isEmpty,
          ).length;

          console.log(
            "\n【シャッフル後】\n" +
              formatDisplay(currentLayout.seats, result.assignment),
          );
          console.log(
            `\n【統計】割り当て済み生徒: ${afterAssignedStudents.size}人, 名無し席: ${afterUnnamedCount}席, 空席: ${afterEmptyCount}席`,
          );

          const newStudents = Array.from(afterAssignedStudents).filter(
            (id) => !beforeAssignedStudents.has(id),
          );
          const removedStudents = Array.from(beforeAssignedStudents).filter(
            (id) => !afterAssignedStudents.has(id),
          );
          if (newStudents.length > 0) {
            console.log(
              `\n【追加された生徒】${newStudents.map((id) => students.find((s) => s.id === id)?.name ?? id).join(", ")}`,
            );
          }
          if (removedStudents.length > 0) {
            console.log(
              `\n【削除された生徒】${removedStudents.map((id) => students.find((s) => s.id === id)?.name ?? id).join(", ")}`,
            );
          }
          const newSeats = currentLayout.seats.map((seat) => {
            if (seat.isEmpty) return seat;
            const assignedStudentId = result.assignment[seat.id];
            if (assignedStudentId) {
              return { ...seat, studentId: assignedStudentId };
            }
            const { studentId, ...rest } = seat;
            return rest;
          });

          const analysis: AssignmentAnalysis | null = result.analysis
            ? {
                totalConditions: result.analysis.totalConditions,
                failedConditions: result.analysis.failedConditions,
                assignment: Object.fromEntries(
                  Object.entries(result.assignment).filter(
                    ([_, v]) => v !== undefined,
                  ),
                ) as { [seatId: string]: string },
              }
            : null;

          set({
            currentLayout: { ...currentLayout, seats: newSeats },
            lastShuffleAnalysis: analysis,
          });
        } else {
          console.error("シャッフルに失敗しました:", result.error);
          set({ lastShuffleAnalysis: null });
        }
      } catch (error) {
        console.error("シャッフル中にエラーが発生しました:", error);
        set({ lastShuffleAnalysis: null });
      } finally {
        set({ isShuffling: false });
      }
    },
  };
}
