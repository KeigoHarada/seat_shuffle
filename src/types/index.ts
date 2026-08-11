import { GenderType } from "../constants";

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

export interface Constraint {
  id: string;
  constraintType:
    | "studentGroup"
    | "studentDistance"
    | "roleDistribution"
    | "genderDistribution";
  isEnabled: boolean;
  params: Record<string, any>;
}

export interface AppSettings {
  gridRows: number;
  gridCols: number;
  soundEnabled: boolean;
  theme: "light" | "dark" | "system";
}

export interface AppState {
  students: Student[];
  roles: Role[];
  groups: Group[];
  seats: Seat[];
  constraints: Constraint[];
  appSettings: AppSettings;
  isViewMode: boolean;
}
