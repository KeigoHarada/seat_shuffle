import type {
  Condition,
  Student,
  Seat,
  Group,
  Role,
  StudentGroupCondition,
  RoleGroupCondition,
  StudentDistanceCondition,
} from "../../types";
import {
  validateAllConditions,
  checkConditionConflicts,
  type ConditionValidationResult,
} from "../../utils/conditionValidator";

type SetState = (partial: unknown) => void;
type GetState = () => unknown;

export function createConditionSlice(set: SetState, get: GetState) {
  return {
    addCondition: (
      condition:
        | StudentGroupCondition
        | RoleGroupCondition
        | StudentDistanceCondition,
    ) =>
      set((state: { conditions: Condition[] }) => ({
        conditions: [...state.conditions, condition],
      })),

    removeCondition: (conditionId: string) =>
      set((state: { conditions: Condition[] }) => ({
        conditions: state.conditions.filter((c) => c.id !== conditionId),
      })),

    updateCondition: (conditionId: string, updates: Partial<Condition>) =>
      set((state: { conditions: Condition[] }) => ({
        conditions: state.conditions.map((c) =>
          c.id === conditionId ? { ...c, ...updates } : c,
        ),
      })),

    toggleCondition: (conditionId: string) =>
      set((state: { conditions: Condition[] }) => ({
        conditions: state.conditions.map((c) =>
          c.id === conditionId ? { ...c, enabled: !c.enabled } : c,
        ),
      })),

    validateConditions: (): ConditionValidationResult => {
      const state = get() as {
        currentLayout: { seats: Seat[] } | null;
        conditions: Condition[];
        students: Student[];
        groups: Group[];
        roles: Role[];
      };
      if (!state.currentLayout) {
        return {
          isValid: false,
          errors: ["席配置が設定されていません"],
          warnings: [],
        };
      }
      return validateAllConditions(
        state.conditions,
        state.students,
        state.groups,
        state.roles,
        state.currentLayout.seats,
      );
    },

    checkConditionConflicts: (): ConditionValidationResult => {
      const state = get() as {
        currentLayout: { seats: Seat[] } | null;
        conditions: Condition[];
        students: Student[];
        groups: Group[];
        roles: Role[];
      };
      if (!state.currentLayout) {
        return {
          isValid: false,
          errors: ["席配置が設定されていません"],
          warnings: [],
        };
      }
      return checkConditionConflicts(
        state.conditions,
        state.students,
        state.groups,
        state.roles,
      );
    },
  };
}
