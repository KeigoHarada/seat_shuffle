import { describe, expect, it } from "vitest";
import { parseProjectBackup, serializeProjectBackup } from "../backup";
import type { AppState } from "../../types";

const state: AppState = {
  students: [
    {
      id: "s1",
      name: "山田",
      gender: "male",
      attendanceNumber: 1,
      roleIds: [],
    },
  ],
  roles: [],
  groups: [{ id: "g1", name: "1班", color: "#FCA5A5" }],
  seats: [
    {
      id: "seat-1",
      studentId: "s1",
      groupIds: ["g1"],
      x: 1,
      y: 2,
      isLocked: true,
    },
  ],
  objects: [],
  constraints: [],
  appSettings: {
    algorithm: "optimize",
    shuffleAnimation: "none",
    autoAssignAlgorithm: "right-top-down",
  },
  isViewMode: true,
};

describe("project backup", () => {
  it("round-trips assignments", () => {
    const text = serializeProjectBackup(state);
    expect(text).toContain('"version":1');
    const parsed = parseProjectBackup(text);
    expect(parsed).toEqual({
      ok: true,
      snapshot: {
        version: 1,
        students: state.students,
        roles: state.roles,
        groups: state.groups,
        seats: state.seats,
        objects: state.objects,
        constraints: state.constraints,
        appSettings: state.appSettings,
      },
    });
  });

  it("rejects corrupt text", () => {
    expect(parseProjectBackup("{")).toEqual({ ok: false, reason: "corrupt" });
    expect(parseProjectBackup("{}")).toEqual({ ok: false, reason: "corrupt" });
    expect(parseProjectBackup(JSON.stringify({ version: 2 }))).toEqual({
      ok: false,
      reason: "corrupt",
    });
  });
});
