export type BaseConstraint = {
  id: string;
  isEnabled: boolean;
};

export type StudentStudentConstraint = BaseConstraint & {
  type: "student-student";
  studentId1: string;
  studentId2: string;
  matchType: "close" | "far";
};

export type StudentGroupConstraint = BaseConstraint & {
  type: "student-group";
  studentId: string;
  groupIds: string[];
  matchType: "include" | "exclude";
};

export type GroupMatchConstraint = BaseConstraint & {
  type: "group-match";
  targetType: "role" | "gender";
  targetId: string;
  groupIds: string[];
  minCount: number;
};

export type Constraint =
  | StudentStudentConstraint
  | StudentGroupConstraint
  | GroupMatchConstraint;
