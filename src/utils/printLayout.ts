import { CanvasObject, Seat, Student } from "../types";
import { GRID_SIZE, SEAT_COLS, SEAT_ROWS } from "../constants/canvas";
import { getCanvasBoundingBox, type CanvasBoundingBox } from "./canvas";

export const A4_SHORT_MM = 210;
export const A4_LONG_MM = 297;
export const PRINT_MARGIN_MM = 10;

const SEAT_INSET_PX = 4;

export type PrintMode = "wall" | "desk";
export type PrintOrientation = "landscape" | "portrait";

export type PrintSource = {
  seats: Seat[];
  objects: CanvasObject[];
  students: Student[];
};

export type PrintSeatLabel =
  | {
      kind: "occupied";
      attendanceNumber: number;
      furigana: string;
      name: string;
      rotation: 0 | 180;
    }
  | {
      kind: "empty";
      rotation: 0 | 180;
    };

export type PrintBox = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
};

export type PrintSeat = PrintBox & {
  id: string;
  label: PrintSeatLabel;
};

export type PrintLandmark = PrintBox & {
  id: string;
  shape: "rectangle" | "circle";
  text: string | null;
};

export type PrintReadyPlan = {
  kind: "ready";
  mode: PrintMode;
  orientation: PrintOrientation;
  pageWidthMm: number;
  pageHeightMm: number;
  seats: PrintSeat[];
  landmarks: PrintLandmark[];
};

export type PrintEmptyPlan = {
  kind: "empty";
};

export type PrintPlan = PrintReadyPlan | PrintEmptyPlan;

type WorldBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

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

function filterTargets(source: PrintSource, selectedIds?: string[]) {
  if (!selectedIds || selectedIds.length === 0) {
    return { seats: source.seats, objects: source.objects };
  }
  const idSet = new Set(selectedIds);
  return {
    seats: source.seats.filter((seat) => idSet.has(seat.id)),
    objects: source.objects.filter((object) => idSet.has(object.id)),
  };
}

function seatLabel(
  seat: Seat,
  students: Student[],
  mode: PrintMode,
): PrintSeatLabel {
  const rotation = rotationForMode(mode);
  const student = students.find((entry) => entry.id === seat.studentId);
  if (!student) {
    return { kind: "empty", rotation };
  }
  return {
    kind: "occupied",
    attendanceNumber: student.attendanceNumber,
    furigana: student.furigana ?? "",
    name: student.name,
    rotation,
  };
}

function fitScale(
  bboxWidth: number,
  bboxHeight: number,
  pageWidthMm: number,
  pageHeightMm: number,
): number {
  const availableWidth = pageWidthMm - PRINT_MARGIN_MM * 2;
  const availableHeight = pageHeightMm - PRINT_MARGIN_MM * 2;
  return Math.min(availableWidth / bboxWidth, availableHeight / bboxHeight);
}

function choosePage(
  bboxWidth: number,
  bboxHeight: number,
): {
  orientation: PrintOrientation;
  pageWidthMm: number;
  pageHeightMm: number;
  scale: number;
} {
  const portraitScale = fitScale(
    bboxWidth,
    bboxHeight,
    A4_SHORT_MM,
    A4_LONG_MM,
  );
  const landscapeScale = fitScale(
    bboxWidth,
    bboxHeight,
    A4_LONG_MM,
    A4_SHORT_MM,
  );
  if (portraitScale > landscapeScale) {
    return {
      orientation: "portrait",
      pageWidthMm: A4_SHORT_MM,
      pageHeightMm: A4_LONG_MM,
      scale: portraitScale,
    };
  }
  return {
    orientation: "landscape",
    pageWidthMm: A4_LONG_MM,
    pageHeightMm: A4_SHORT_MM,
    scale: landscapeScale,
  };
}

function toPct(
  box: WorldBox,
  bbox: CanvasBoundingBox,
  scale: number,
  pageWidthMm: number,
  pageHeightMm: number,
): PrintBox {
  const availableWidth = pageWidthMm - PRINT_MARGIN_MM * 2;
  const availableHeight = pageHeightMm - PRINT_MARGIN_MM * 2;
  const contentWidth = bbox.width * scale;
  const contentHeight = bbox.height * scale;
  const originX = PRINT_MARGIN_MM + (availableWidth - contentWidth) / 2;
  const originY = PRINT_MARGIN_MM + (availableHeight - contentHeight) / 2;
  const leftMm = originX + (box.x - bbox.minX) * scale;
  const topMm = originY + (box.y - bbox.minY) * scale;
  return {
    leftPct: (leftMm / pageWidthMm) * 100,
    topPct: (topMm / pageHeightMm) * 100,
    widthPct: ((box.w * scale) / pageWidthMm) * 100,
    heightPct: ((box.h * scale) / pageHeightMm) * 100,
  };
}

function overflows(
  boxes: PrintBox[],
  pageWidthMm: number,
  pageHeightMm: number,
): boolean {
  const slopMm = 0.02;
  return boxes.some((box) => {
    const left = (box.leftPct / 100) * pageWidthMm;
    const top = (box.topPct / 100) * pageHeightMm;
    const right = left + (box.widthPct / 100) * pageWidthMm;
    const bottom = top + (box.heightPct / 100) * pageHeightMm;
    return (
      left < PRINT_MARGIN_MM - slopMm ||
      top < PRINT_MARGIN_MM - slopMm ||
      right > pageWidthMm - PRINT_MARGIN_MM + slopMm ||
      bottom > pageHeightMm - PRINT_MARGIN_MM + slopMm
    );
  });
}

export function printOrientationLabel(orientation: PrintOrientation): string {
  switch (orientation) {
    case "landscape":
      return "A4 横（自動）";
    case "portrait":
      return "A4 縦（自動）";
    default: {
      const _exhaustive: never = orientation;
      return _exhaustive;
    }
  }
}

export function createPrintPlan(
  source: PrintSource,
  mode: PrintMode,
  selectedIds?: string[],
): PrintPlan {
  const { seats, objects } = filterTargets(source, selectedIds);
  if (seats.length === 0 && objects.length === 0) {
    return { kind: "empty" };
  }

  const bbox = getCanvasBoundingBox(seats, objects);
  if (!bbox || bbox.width <= 0 || bbox.height <= 0) {
    return { kind: "empty" };
  }

  const page = choosePage(bbox.width, bbox.height);
  const worldSeats: WorldBox[] = seats.map((seat) => ({
    x: seat.x * GRID_SIZE + SEAT_INSET_PX,
    y: seat.y * GRID_SIZE + SEAT_INSET_PX,
    w: SEAT_COLS * GRID_SIZE - SEAT_INSET_PX * 2,
    h: SEAT_ROWS * GRID_SIZE - SEAT_INSET_PX * 2,
  }));
  const worldObjects: WorldBox[] = objects.map((object) => ({
    x: object.x * GRID_SIZE,
    y: object.y * GRID_SIZE,
    w: object.width * GRID_SIZE,
    h: object.height * GRID_SIZE,
  }));

  const layout = (scale: number) => {
    const seatBoxes = worldSeats.map((box) =>
      toPct(box, bbox, scale, page.pageWidthMm, page.pageHeightMm),
    );
    const objectBoxes = worldObjects.map((box) =>
      toPct(box, bbox, scale, page.pageWidthMm, page.pageHeightMm),
    );
    return { seatBoxes, objectBoxes };
  };

  let scale = page.scale;
  let { seatBoxes, objectBoxes } = layout(scale);
  for (let attempt = 0; attempt < 8; attempt++) {
    if (
      !overflows(
        [...seatBoxes, ...objectBoxes],
        page.pageWidthMm,
        page.pageHeightMm,
      )
    ) {
      break;
    }
    scale *= 0.999;
    ({ seatBoxes, objectBoxes } = layout(scale));
  }

  return {
    kind: "ready",
    mode,
    orientation: page.orientation,
    pageWidthMm: page.pageWidthMm,
    pageHeightMm: page.pageHeightMm,
    seats: seats.map((seat, index) => ({
      id: seat.id,
      ...seatBoxes[index],
      label: seatLabel(seat, source.students, mode),
    })),
    landmarks: objects.map((object, index) => ({
      id: object.id,
      shape: object.type,
      text: object.text ?? null,
      ...objectBoxes[index],
    })),
  };
}
