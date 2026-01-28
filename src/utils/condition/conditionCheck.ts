import {
  Condition,
  Student,
  Seat,
  Group,
  Role,
  ConditionCheckResult,
  AssignmentAnalysis,
} from "../../types";
import { checkStudentGroupCondition } from "./groupCheck";
import { checkRoleGroupCondition } from "./roleCheck";
import { checkStudentDistanceCondition } from "./distanceCheck";

// 配置結果を分析
export const analyzeAssignment = (
  assignments: { [seatId: string]: string },
  conditions: Condition[],
  students: Student[],
  seats: Seat[],
  groups: Group[],
  roles: Role[],
): AssignmentAnalysis => {
  const failedConditions: ConditionCheckResult[] = [];

  for (const condition of conditions) {
    if (!condition.enabled) continue;

    let result: ConditionCheckResult;

    switch (condition.type) {
      case "student-group":
        result = checkStudentGroupCondition(
          condition,
          assignments,
          students,
          seats,
        );
        break;

      case "role-group":
        result = checkRoleGroupCondition(
          condition,
          assignments,
          students,
          seats,
          groups,
          roles,
        );
        break;

      case "student-distance":
        result = checkStudentDistanceCondition(
          condition,
          assignments,
          students,
          seats,
        );
        break;

      default:
        result = { condition, satisfied: true };
    }

    if (!result.satisfied) {
      failedConditions.push(result);
    }
  }

  return {
    totalConditions: conditions.filter((c) => c.enabled).length,
    failedConditions,
    assignment: assignments,
  };
};
