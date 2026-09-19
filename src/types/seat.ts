export interface Seat {
  id: string;
  studentId: string | null;
  groupIds: string[];
  x: number;
  y: number;
  isLocked: boolean;
}
