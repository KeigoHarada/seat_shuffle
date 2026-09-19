import type { CanvasObject } from "./canvas";
import type { Seat } from "./seat";
import type { Student } from "./student";

export type PrintMode = "wall" | "desk";
export type PrintOrientation = "portrait" | "landscape";

export type PrintSource = {
  students: ReadonlyArray<
    Pick<Student, "id" | "name" | "furigana" | "attendanceNumber">
  >;
  seats: ReadonlyArray<Pick<Seat, "id" | "studentId" | "x" | "y">>;
  objects: ReadonlyArray<
    Pick<CanvasObject, "id" | "type" | "x" | "y" | "width" | "height" | "text">
  >;
};

export type PrintFrame = {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
};

export type PrintPlan =
  | { kind: "empty"; reason: "no-marks" }
  | {
      kind: "ready";
      mode: PrintMode;
      page: {
        paper: "A4";
        orientation: PrintOrientation;
        marginMm: 10;
        contentWidthMm: number;
        contentHeightMm: number;
      };
      seats: ReadonlyArray<{
        id: string;
        frame: PrintFrame;
        label:
          | {
              kind: "occupied";
              rotation: 0 | 180;
              attendanceNumber: number;
              furigana: string | null;
              name: string;
            }
          | {
              kind: "empty";
              rotation: 0 | 180;
            };
      }>;
      landmarks: ReadonlyArray<{
        id: string;
        shape: "rectangle" | "circle";
        frame: PrintFrame;
        text: string | null;
        rotation: 0 | 180;
      }>;
    };
