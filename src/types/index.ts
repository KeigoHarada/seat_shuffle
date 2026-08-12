import { GenderType } from "../constants";

export type SeatId = string;

export interface Student {
  id: string;
  name: string;
  furigana?: string;
  gender: GenderType;
  attendanceNumber: number;
  roleIds: string[];
}

export interface Role {
  id: string;
  name: string;
  iconName: string;
  description?: string;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Seat {
  id: string;
  studentId: string | null;
  groupIds: string[];
  x: number;
  y: number;
  isLocked: boolean;
}

export interface CanvasObject {
  id: string;
  type: "rectangle" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color?: string;
}

export interface AppSettings {
  gridRows: number;
  gridCols: number;
  soundEnabled: boolean;
  theme: "light" | "dark" | "system";
  algorithm: "random" | "optimize";
}

export interface AppState {
  students: Student[];
  roles: Role[];
  groups: Group[];
  seats: Seat[];
  objects: CanvasObject[];
  constraints: Constraint[];
  appSettings: AppSettings;
  isViewMode: boolean;
}

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
  targetId: string; // roleId or GenderType
  groupIds: string[];
  minCount: number;
};

export type Constraint =
  StudentStudentConstraint | StudentGroupConstraint | GroupMatchConstraint;
