import type { AppState } from "../types/app";
import type { CanvasObject } from "../types/canvas";
import type { Seat } from "../types/seat";

import {
  UNDOABLE_KEYS,
  MAX_UNDO_STACK,
  type UndoableKey,
  type UndoSnapshot,
  type UndoLiveRefs,
} from "../types/history";

export { UNDOABLE_KEYS, MAX_UNDO_STACK };
export type { UndoableKey, UndoSnapshot, UndoLiveRefs };

export function captureUndoSnapshot(
  state: Pick<AppState, UndoableKey>,
): UndoSnapshot {
  return Object.fromEntries(
    UNDOABLE_KEYS.map((key) => [key, structuredClone(state[key])]),
  ) as UndoSnapshot;
}

export function applyUndoSnapshot(
  snapshot: UndoSnapshot,
  live: UndoLiveRefs,
): UndoSnapshot {
  const next = captureUndoSnapshot(snapshot);
  next.seats = next.seats.map((seat) => ({
    ...seat,
    studentId:
      seat.studentId !== null && live.studentIds.has(seat.studentId)
        ? seat.studentId
        : null,
    groupIds: seat.groupIds.filter((id) => live.groupIds.has(id)),
  }));
  return next;
}

export function undoSnapshotsEqual(a: UndoSnapshot, b: UndoSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function limitUndoStack(stack: UndoSnapshot[]): UndoSnapshot[] {
  if (stack.length <= MAX_UNDO_STACK) return stack;
  return stack.slice(-MAX_UNDO_STACK);
}

export function appendUndoSnapshot(
  stack: UndoSnapshot[],
  snapshot: UndoSnapshot,
): UndoSnapshot[] {
  const last = stack[stack.length - 1];
  if (last && undoSnapshotsEqual(last, snapshot)) return stack;
  return limitUndoStack([...stack, snapshot]);
}

function isUndoSnapshot(value: unknown): value is UndoSnapshot {
  if (value === null || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return UNDOABLE_KEYS.every((key) => Array.isArray(record[key]));
}

export function readPersistedUndoStack(
  persisted: Record<string, unknown>,
): UndoSnapshot[] {
  if (Array.isArray(persisted.undoStack)) {
    return limitUndoStack(
      persisted.undoStack.filter(isUndoSnapshot).map(captureUndoSnapshot),
    );
  }

  if (!Array.isArray(persisted.pastSeats)) return [];

  const objects = Array.isArray(persisted.objects)
    ? (persisted.objects as CanvasObject[])
    : [];

  return limitUndoStack(
    persisted.pastSeats.flatMap((seats) => {
      if (!Array.isArray(seats)) return [];
      return [captureUndoSnapshot({ seats: seats as Seat[], objects })];
    }),
  );
}
