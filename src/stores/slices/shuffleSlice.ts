import type { Student, Seat, Condition, Group, Role } from "../../types";
import type { AssignmentAnalysis } from "../../utils/conditionUtils";
import { ShuffleManager } from "../../utils/ShuffleManager";
import { ConditionalShuffleAlgorithm } from "../../algorithms/ConditionalShuffleAlgorithm";
import { RandomShuffleAlgorithm } from "../../algorithms/RandomShuffleAlgorithm";

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

  return {
    shuffleManager,

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

      set({ isShuffling: true });

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const {
          currentLayout,
          students,
          conditions,
          groups,
          roles,
          shuffleManager: manager,
        } = get() as ShuffleState;
        if (!currentLayout) return;

        const enabledConditions = conditions.filter((c) => c.enabled);
        if (enabledConditions.length === 0) {
          manager.setAlgorithm("random");
        } else {
          manager.setAlgorithm("conditional");
        }

        const result = await manager.shuffle(
          students,
          currentLayout.seats,
          conditions,
          groups,
          roles,
        );

        if (result.success) {
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
