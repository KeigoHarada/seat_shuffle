import { Condition } from "../../types";

export function isStudentGroupCondition(
  condition: Condition,
): condition is Extract<Condition, { type: "student-group" }> {
  return condition.type === "student-group";
}

export function isRoleGroupCondition(
  condition: Condition,
): condition is Extract<Condition, { type: "role-group" }> {
  return condition.type === "role-group";
}

export function isStudentDistanceCondition(
  condition: Condition,
): condition is Extract<Condition, { type: "student-distance" }> {
  return condition.type === "student-distance";
}
