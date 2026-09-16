import { Seat, CanvasObject } from "../types";
import { SEAT_COLS, SEAT_ROWS } from "../constants/canvas";

export const generateTemplate = (
  templateId: string,
  startX: number,
  startY: number,
): { seats: Seat[]; objects: CanvasObject[] } => {
  const newSeats: Seat[] = [];
  const newObjects: CanvasObject[] = [];

  const addSeat = (x: number, y: number) => {
    newSeats.push({
      id: crypto.randomUUID(),
      studentId: null,
      groupIds: [],
      x,
      y,
      isLocked: false,
    });
  };

  if (templateId === "classroom") {
    const colXOffsets = [0, 6, 14, 20, 28, 34];
    const rowYOffsets = [0, 6, 12, 18, 24];

    for (let c = 0; c < colXOffsets.length; c++) {
      for (let r = 0; r < rowYOffsets.length; r++) {
        addSeat(startX + colXOffsets[c], startY + rowYOffsets[r]);
      }
    }

    newObjects.push({
      id: crypto.randomUUID(),
      type: "rectangle",
      x: startX + 16,
      y: startY - 6,
      width: 8,
      height: 4,
      text: "教卓",
      color: "var(--c-surface-disabled)",
    });
  } else if (templateId === "group4") {
    addSeat(startX, startY);
    addSeat(startX + SEAT_COLS, startY);
    addSeat(startX, startY + SEAT_ROWS);
    addSeat(startX + SEAT_COLS, startY + SEAT_ROWS);
  } else if (templateId === "group6_v") {
    for (let r = 0; r < 3; r++) {
      addSeat(startX, startY + r * SEAT_ROWS);
      addSeat(startX + SEAT_COLS, startY + r * SEAT_ROWS);
    }
  } else if (templateId === "group6_h") {
    for (let c = 0; c < 3; c++) {
      addSeat(startX + c * SEAT_COLS, startY);
      addSeat(startX + c * SEAT_COLS, startY + SEAT_ROWS);
    }
  }

  return { seats: newSeats, objects: newObjects };
};
