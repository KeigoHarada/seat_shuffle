export type GenderType = "male" | "female" | "other";

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
