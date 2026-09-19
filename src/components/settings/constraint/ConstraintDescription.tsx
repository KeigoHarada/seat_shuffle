import React from "react";
import type { Constraint } from "../../../types/constraint";
import type { Student, Role } from "../../../types/student";
import type { Group } from "../../../types/group";
import { GENDER_OPTIONS } from "../../../constants/gender";

interface ConstraintDescriptionProps {
  constraint: Constraint;
  students: Student[];
  roles: Role[];
  groups: Group[];
}

const ConstraintDescription: React.FC<ConstraintDescriptionProps> = ({
  constraint,
  students,
  roles,
  groups,
}) => {
  const getStudentName = (id: string) =>
    students.find((s) => s.id === id)?.name || "不明な生徒";
  const getRoleName = (id: string) =>
    roles.find((r) => r.id === id)?.name || "不明な役割";
  const getGenderLabel = (id: string) =>
    GENDER_OPTIONS.find((g) => g.value === id)?.label || "不明な性別";
  const getGroupName = (id: string) =>
    groups.find((g) => g.id === id)?.name || "不明なグループ";

  if (constraint.type === "student-student") {
    const isClose = constraint.matchType === "close";
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "13px",
            color: "var(--c-text-main)",
          }}
        >
          {getStudentName(constraint.studentId1)} と{" "}
          {getStudentName(constraint.studentId2)}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--c-text-sub)",
          }}
        >
          {isClose ? "同じ班にする" : "別の班にする"}
        </div>
      </div>
    );
  }

  if (constraint.type === "student-group") {
    const isInclude = constraint.matchType === "include";
    const groupNames = constraint.groupIds
      .map((id: string) => getGroupName(id))
      .join(" または ");
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "13px",
            color: "var(--c-text-main)",
          }}
        >
          {getStudentName(constraint.studentId)}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--c-text-sub)",
          }}
        >
          {groupNames} に {isInclude ? "入れる" : "入れない"}
        </div>
      </div>
    );
  }

  if (constraint.type === "group-match") {
    const targetName =
      constraint.targetType === "role"
        ? getRoleName(constraint.targetId)
        : getGenderLabel(constraint.targetId);

    const groupNames = constraint.groupIds
      .map((id: string) => getGroupName(id))
      .join(", ");

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "13px",
            color: "var(--c-text-main)",
          }}
        >
          {constraint.targetType === "role" ? "役割:" : "性別:"} {targetName}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--c-text-sub)",
          }}
        >
          {groupNames} にそれぞれ {constraint.minCount} 人以上
        </div>
      </div>
    );
  }

  return null;
};

export default ConstraintDescription;
