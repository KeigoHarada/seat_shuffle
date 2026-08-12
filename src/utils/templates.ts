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
      x: startX + 3 * (SEAT_COLS + 2),
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
  } else if (templateId === "group6") {
    // 3x2 facing each other
    for (let c = 0; c < 3; c++) {
      addSeat(startX + c * SEAT_COLS, startY);
      addSeat(startX + c * SEAT_COLS, startY + SEAT_ROWS);
    }
  } else if (templateId === "round") {
    // Round table with seats around it
    newObjects.push({
      id: crypto.randomUUID(),
      type: "circle",
      x: startX + SEAT_COLS,
      y: startY + SEAT_ROWS,
      width: SEAT_COLS * 2,
      height: SEAT_COLS * 2,
      text: "円卓",
      color: "var(--c-surface-disabled)",
    });
    // Top
    addSeat(startX + SEAT_COLS + Math.floor(SEAT_COLS / 2), startY - 2);
    // Bottom
    addSeat(
      startX + SEAT_COLS + Math.floor(SEAT_COLS / 2),
      startY + SEAT_ROWS + SEAT_COLS * 2 + 2,
    );
    // Left
    addSeat(startX - 2, startY + SEAT_ROWS + Math.floor(SEAT_COLS / 2));
    // Right
    addSeat(
      startX + SEAT_COLS * 3 + 2,
      startY + SEAT_ROWS + Math.floor(SEAT_COLS / 2),
    );
  } else if (templateId === "multipurpose") {
    // Group of 4 tables scattered
    for (let i = 0; i < 4; i++) {
      const px = startX + (i % 2) * (SEAT_COLS * 4);
      const py = startY + Math.floor(i / 2) * (SEAT_ROWS * 4);
      addSeat(px, py);
      addSeat(px + SEAT_COLS, py);
      addSeat(px, py + SEAT_ROWS);
      addSeat(px + SEAT_COLS, py + SEAT_ROWS);
    }
  } else if (templateId === "schooltrip") {
    // Bus layout
    for (let r = 0; r < 10; r++) {
      // Left side (2 seats)
      addSeat(startX, startY + r * (SEAT_ROWS + 1));
      addSeat(startX + SEAT_COLS, startY + r * (SEAT_ROWS + 1));
      // Aisle
      // Right side (2 seats)
      addSeat(startX + SEAT_COLS * 3, startY + r * (SEAT_ROWS + 1));
      addSeat(startX + SEAT_COLS * 4, startY + r * (SEAT_ROWS + 1));
    }
  }

  return { seats: newSeats, objects: newObjects };
};
