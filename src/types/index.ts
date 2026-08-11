export type Student = {
  id: string;
  attendanceNumber: number;
  name: string;
  furigana: string | null;
  gender: "male" | "female" | "other";
  roleIds: string[];
  groupIds: string[];
};

export type Role = {
  id: string;
  name: string;
  iconName: string;
  description: string | null;
};

export type Group = {
  id: string;
  name: string;
  color: string;
  description: string | null;
};

export type Seat = {
  id: string;
  studentId: string | null;
  groupIds: string[];
  x: number;
  y: number;
  isLocked: boolean;
};

export type StudentGroupConstraint = {
  id: string;
  constraintType: "studentGroup";
  studentId: string;
  groupId: string;
  type: "include" | "exclude";
  isEnabled: boolean;
};

export type StudentDistanceConstraint = {
  id: string;
  constraintType: "studentDistance";
  studentId1: string;
  studentId2: string;
  type: "close" | "far";
  isEnabled: boolean;
};

export type RoleDistributionConstraint = {
  id: string;
  constraintType: "roleDistribution";
  roleId: string;
  isEnabled: boolean;
};

export type GenderDistributionConstraint = {
  id: string;
  constraintType: "genderDistribution";
  gender: "male" | "female" | "other";
  isEnabled: boolean;
};

export type Constraint =
  | StudentGroupConstraint
  | StudentDistanceConstraint
  | RoleDistributionConstraint
  | GenderDistributionConstraint;

export type AppSettings = {
  viewMode: "edit" | "student_readonly";
  perspective: "teacher" | "student";
};
