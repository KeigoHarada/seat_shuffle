import { CanvasObject, Seat, Student } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";
import { getCanvasBoundingBox, type CanvasBoundingBox } from "./canvas";

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

const A4_SHORT_MM = 210;
const A4_LONG_MM = 297;
const MARGIN_MM = 10;
const LANDSCAPE_CONTENT = {
  orientation: "landscape" as const,
  contentWidthMm: A4_LONG_MM - MARGIN_MM * 2,
  contentHeightMm: A4_SHORT_MM - MARGIN_MM * 2,
};
const PORTRAIT_CONTENT = {
  orientation: "portrait" as const,
  contentWidthMm: A4_SHORT_MM - MARGIN_MM * 2,
  contentHeightMm: A4_LONG_MM - MARGIN_MM * 2,
};

function emptyPlan(): Extract<PrintPlan, { kind: "empty" }> {
  return { kind: "empty", reason: "no-marks" };
}

function rotationForMode(mode: PrintMode): 0 | 180 {
  switch (mode) {
    case "wall":
      return 0;
    case "desk":
      return 180;
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

function landmarkShape(
  type: PrintSource["objects"][number]["type"],
): "rectangle" | "circle" {
  switch (type) {
    case "rectangle":
      return "rectangle";
    case "circle":
      return "circle";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function filterMarks(source: PrintSource, selectedIds?: readonly string[]) {
  if (!selectedIds || selectedIds.length === 0) {
    return { seats: source.seats, objects: source.objects };
  }
  const idSet = new Set(selectedIds);
  return {
    seats: source.seats.filter((seat) => idSet.has(seat.id)),
    objects: source.objects.filter((object) => idSet.has(object.id)),
  };
}

function toLayoutSeats(seats: PrintSource["seats"]): Seat[] {
  return seats.map((seat) => ({
    id: seat.id,
    studentId: seat.studentId,
    x: seat.x,
    y: seat.y,
    groupIds: [],
    isLocked: false,
  }));
}

function toLayoutObjects(objects: PrintSource["objects"]): CanvasObject[] {
  return objects.map((object) => ({
    id: object.id,
    type: object.type,
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
    text: object.text,
  }));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function scaleFor(
  contentWidthMm: number,
  contentHeightMm: number,
  bbox: CanvasBoundingBox,
): number {
  return Math.min(contentWidthMm / bbox.width, contentHeightMm / bbox.height);
}

function placeFrame(
  worldX: number,
  worldY: number,
  worldW: number,
  worldH: number,
  bbox: CanvasBoundingBox,
  scale: number,
  contentWidthMm: number,
  contentHeightMm: number,
): PrintFrame {
  const offsetX = (contentWidthMm - bbox.width * scale) / 2;
  const offsetY = (contentHeightMm - bbox.height * scale) / 2;
  return {
    xMm: round2((worldX - bbox.minX) * scale + offsetX),
    yMm: round2((worldY - bbox.minY) * scale + offsetY),
    widthMm: round2(worldW * scale),
    heightMm: round2(worldH * scale),
  };
}

function frameOutside(
  frame: PrintFrame,
  contentWidthMm: number,
  contentHeightMm: number,
): boolean {
  return (
    frame.xMm < 0 ||
    frame.yMm < 0 ||
    frame.xMm + frame.widthMm > contentWidthMm ||
    frame.yMm + frame.heightMm > contentHeightMm
  );
}

function occupiedLabel(
  student: Pick<Student, "name" | "furigana" | "attendanceNumber">,
  rotation: 0 | 180,
) {
  return {
    kind: "occupied" as const,
    rotation,
    attendanceNumber: student.attendanceNumber,
    furigana: student.furigana?.trim() ? student.furigana : null,
    name: student.name,
  };
}

function emptyLabel(rotation: 0 | 180) {
  return {
    kind: "empty" as const,
    rotation,
  };
}

export function printOrientationLabel(orientation: PrintOrientation): string {
  switch (orientation) {
    case "landscape":
      return "A4 横";
    case "portrait":
      return "A4 縦";
    default: {
      const _exhaustive: never = orientation;
      return _exhaustive;
    }
  }
}

function pageContent(orientation: PrintOrientation) {
  switch (orientation) {
    case "landscape":
      return LANDSCAPE_CONTENT;
    case "portrait":
      return PORTRAIT_CONTENT;
    default: {
      const _exhaustive: never = orientation;
      return _exhaustive;
    }
  }
}

function autoOrientation(bbox: CanvasBoundingBox): PrintOrientation {
  const landscapeScale = scaleFor(
    LANDSCAPE_CONTENT.contentWidthMm,
    LANDSCAPE_CONTENT.contentHeightMm,
    bbox,
  );
  const portraitScale = scaleFor(
    PORTRAIT_CONTENT.contentWidthMm,
    PORTRAIT_CONTENT.contentHeightMm,
    bbox,
  );
  return portraitScale > landscapeScale ? "portrait" : "landscape";
}

export function printPageRule(orientation: PrintOrientation): string {
  switch (orientation) {
    case "landscape":
    case "portrait":
      return `@page { size: A4 ${orientation}; margin: 0; }`;
    default: {
      const _exhaustive: never = orientation;
      return _exhaustive;
    }
  }
}

export function createPrintPlan(
  source: PrintSource,
  mode: PrintMode,
  selectedIds?: readonly string[],
  orientation?: PrintOrientation,
): PrintPlan {
  const { seats, objects } = filterMarks(source, selectedIds);
  if (seats.length === 0 && objects.length === 0) {
    return emptyPlan();
  }

  const bbox = getCanvasBoundingBox(
    toLayoutSeats(seats),
    toLayoutObjects(objects),
  );
  if (!bbox || bbox.width <= 0 || bbox.height <= 0) {
    return emptyPlan();
  }

  const page = pageContent(orientation ?? autoOrientation(bbox));
  const contentWidthMm = page.contentWidthMm;
  const contentHeightMm = page.contentHeightMm;
  let scale = scaleFor(contentWidthMm, contentHeightMm, bbox);

  const layoutFrames = (nextScale: number) => ({
    seatFrames: seats.map((seat) =>
      placeFrame(
        seat.x * GRID_SIZE,
        seat.y * GRID_SIZE,
        SEAT_COLS * GRID_SIZE,
        SEAT_ROWS * GRID_SIZE,
        bbox,
        nextScale,
        contentWidthMm,
        contentHeightMm,
      ),
    ),
    objectFrames: objects.map((object) =>
      placeFrame(
        object.x * GRID_SIZE,
        object.y * GRID_SIZE,
        object.width * GRID_SIZE,
        object.height * GRID_SIZE,
        bbox,
        nextScale,
        contentWidthMm,
        contentHeightMm,
      ),
    ),
  });

  let { seatFrames, objectFrames } = layoutFrames(scale);
  const allFrames = [...seatFrames, ...objectFrames];
  if (
    allFrames.some((frame) =>
      frameOutside(frame, contentWidthMm, contentHeightMm),
    )
  ) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const frame of allFrames) {
      minX = Math.min(minX, frame.xMm);
      minY = Math.min(minY, frame.yMm);
      maxX = Math.max(maxX, frame.xMm + frame.widthMm);
      maxY = Math.max(maxY, frame.yMm + frame.heightMm);
    }
    const usedWidth = Math.max(maxX - minX, Number.EPSILON);
    const usedHeight = Math.max(maxY - minY, Number.EPSILON);
    const shrink = Math.min(
      contentWidthMm / usedWidth,
      contentHeightMm / usedHeight,
    );
    scale *= shrink < 1 ? shrink : 0.999;
    ({ seatFrames, objectFrames } = layoutFrames(scale));
  }

  const studentsById = new Map(
    source.students.map((student) => [student.id, student]),
  );
  const rotation = rotationForMode(mode);

  return {
    kind: "ready",
    mode,
    page: {
      paper: "A4",
      orientation: page.orientation,
      marginMm: 10,
      contentWidthMm,
      contentHeightMm,
    },
    seats: seats.map((seat, index) => {
      const student = seat.studentId
        ? studentsById.get(seat.studentId)
        : undefined;
      return {
        id: seat.id,
        frame: seatFrames[index],
        label: student
          ? occupiedLabel(student, rotation)
          : emptyLabel(rotation),
      };
    }),
    landmarks: objects.map((object, index) => ({
      id: object.id,
      shape: landmarkShape(object.type),
      frame: objectFrames[index],
      text: object.text ?? null,
      rotation,
    })),
  };
}
