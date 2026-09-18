import { describe, expect, it } from "vitest";
import type { CanvasObject, Seat } from "../../types";
import {
  UNDOABLE_KEYS,
  applyUndoSnapshot,
  captureUndoSnapshot,
  readPersistedUndoStack,
  undoSnapshotsEqual,
} from "../undo";

function seat(partial: Partial<Seat> & Pick<Seat, "id">): Seat {
  return {
    studentId: null,
    groupIds: [],
    x: 0,
    y: 0,
    isLocked: false,
    ...partial,
  };
}

function desk(
  partial: Partial<CanvasObject> & Pick<CanvasObject, "id">,
): CanvasObject {
  return {
    type: "rectangle",
    x: 0,
    y: 0,
    width: 4,
    height: 2,
    ...partial,
  };
}

describe("undo snapshot", () => {
  it("captures only UNDOABLE_KEYS", () => {
    expect([...UNDOABLE_KEYS]).toEqual(["seats", "objects"]);
    const snapshot = captureUndoSnapshot({
      seats: [seat({ id: "a", x: 1 })],
      objects: [desk({ id: "d" })],
    });
    expect(Object.keys(snapshot).sort()).toEqual(["objects", "seats"]);
  });

  it("clones so later edits do not rewrite history", () => {
    const seats = [seat({ id: "a", x: 1 })];
    const objects = [desk({ id: "d", text: "教卓" })];
    const snapshot = captureUndoSnapshot({ seats, objects });
    seats[0].x = 99;
    objects[0].text = "changed";
    expect(snapshot.seats[0].x).toBe(1);
    expect(snapshot.objects[0].text).toBe("教卓");
  });

  it("clears missing student and group ids on restore", () => {
    const snapshot = captureUndoSnapshot({
      seats: [
        seat({
          id: "a",
          studentId: "gone",
          groupIds: ["keep", "gone-group"],
        }),
      ],
      objects: [],
    });
    const restored = applyUndoSnapshot(snapshot, {
      studentIds: new Set(["keep-student"]),
      groupIds: new Set(["keep"]),
    });
    expect(restored.seats[0].studentId).toBeNull();
    expect(restored.seats[0].groupIds).toEqual(["keep"]);
  });

  it("treats identical snapshots as equal", () => {
    const state = {
      seats: [seat({ id: "a" })],
      objects: [desk({ id: "d" })],
    };
    expect(
      undoSnapshotsEqual(
        captureUndoSnapshot(state),
        captureUndoSnapshot(state),
      ),
    ).toBe(true);
  });

  it("migrates legacy pastSeats plus current objects", () => {
    const seats = [seat({ id: "old" })];
    const objects = [desk({ id: "desk" })];
    const stack = readPersistedUndoStack({
      pastSeats: [seats],
      objects,
    });
    expect(stack).toHaveLength(1);
    expect(stack[0].seats[0].id).toBe("old");
    expect(stack[0].objects[0].id).toBe("desk");
  });

  it("prefers undoStack over pastSeats", () => {
    const stack = readPersistedUndoStack({
      undoStack: [
        {
          seats: [seat({ id: "new" })],
          objects: [],
        },
      ],
      pastSeats: [[seat({ id: "old" })]],
    });
    expect(stack).toHaveLength(1);
    expect(stack[0].seats[0].id).toBe("new");
  });
});
