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
    // 2人ペア×3列（計6列）、5行（計30席）の標準的な教室配置
    const colXOffsets = [0, 6, 14, 20, 28, 34];
    const rowYOffsets = [0, 6, 12, 18, 24];

    for (let c = 0; c < colXOffsets.length; c++) {
      for (let r = 0; r < rowYOffsets.length; r++) {
        addSeat(startX + colXOffsets[c], startY + rowYOffsets[r]);
      }
    }

    // Add teacher's desk (教卓)
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
  } else if (templateId === "bus") {
    // 修学旅行バス: 2列・通路・2列 × 10行（計40席）
    const colXOffsets = [0, 6, 20, 26];
    const rowYOffsets = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54];

    for (let c = 0; c < colXOffsets.length; c++) {
      for (let r = 0; r < rowYOffsets.length; r++) {
        addSeat(startX + colXOffsets[c], startY + rowYOffsets[r]);
      }
    }

    // 前方右側に運転席（日本は右ハンドル）
    newObjects.push({
      id: crypto.randomUUID(),
      type: "rectangle",
      x: startX + 26,
      y: startY - 6,
      width: 6,
      height: 4,
      text: "運転席",
      color: "var(--c-surface-disabled)",
    });
  }

  return { seats: newSeats, objects: newObjects };
};
