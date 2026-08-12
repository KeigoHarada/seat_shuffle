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
    // 7 cols x 6 rows of seats
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        // gap between pairs? no, let's just make a simple grid with some spacing
        addSeat(startX + c * (SEAT_COLS + 2), startY + r * (SEAT_ROWS + 2));
      }
    }
    // Add teacher's desk
    newObjects.push({
      id: crypto.randomUUID(),
      type: "rectangle",
      x: startX + 3 * (SEAT_COLS + 2) - Math.floor(SEAT_COLS / 2),
      y: startY - (SEAT_ROWS + 4),
      width: SEAT_COLS * 2,
      height: SEAT_ROWS,
      text: "教卓",
      color: "var(--c-surface-disabled)",
    });
  } else if (templateId === "group4") {
    // 2x2 facing each other
    addSeat(startX, startY);
    addSeat(startX + SEAT_COLS, startY);
    addSeat(startX, startY + SEAT_ROWS);
    addSeat(startX + SEAT_COLS, startY + SEAT_ROWS);
  } else if (templateId === "group6_v") {
    // 2x3 (縦)
    for (let r = 0; r < 3; r++) {
      addSeat(startX, startY + r * SEAT_ROWS);
      addSeat(startX + SEAT_COLS, startY + r * SEAT_ROWS);
    }
  } else if (templateId === "group6_h") {
    // 3x2 (横)
    for (let c = 0; c < 3; c++) {
      addSeat(startX + c * SEAT_COLS, startY);
      addSeat(startX + c * SEAT_COLS, startY + SEAT_ROWS);
    }
  }

  return { seats: newSeats, objects: newObjects };
};
