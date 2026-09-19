import type { AppState } from "./app";

/** Fields restored by Undo. Add a key to include it. */
export const UNDOABLE_KEYS = ["seats", "objects"] as const;

/** Oldest entries drop first. */
export const MAX_UNDO_STACK = 50;

export type UndoableKey = (typeof UNDOABLE_KEYS)[number];

export type UndoSnapshot = {
  [K in UndoableKey]: AppState[K];
};

export type UndoLiveRefs = {
  studentIds: ReadonlySet<string>;
  groupIds: ReadonlySet<string>;
};
