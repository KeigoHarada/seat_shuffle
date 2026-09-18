import { describe, expect, it } from "vitest";
import { applyRosterImport, parseRosterCsv } from "../roster";
import type { AppState } from "../../types";

const baseState = (): AppState => ({
  students: [
    {
      id: "old-s",
      name: "旧生徒",
      gender: "male",
      attendanceNumber: 1,
      roleIds: ["role-leader"],
    },
  ],
  roles: [{ id: "role-leader", name: "班長", iconName: "Crown" }],
  groups: [{ id: "g1", name: "1班", color: "#FCA5A5" }],
  seats: [
    {
      id: "seat-1",
      studentId: "old-s",
      groupIds: ["g1"],
      x: 2,
      y: 3,
      isLocked: true,
    },
  ],
  objects: [
    {
      id: "obj-1",
      type: "rectangle",
      x: 0,
      y: 0,
      width: 2,
      height: 1,
      text: "教卓",
    },
  ],
  constraints: [
    {
      id: "c1",
      type: "student-student",
      studentId1: "old-s",
      studentId2: "other",
      matchType: "far",
      isEnabled: true,
    },
    {
      id: "c2",
      type: "student-group",
      studentId: "old-s",
      groupIds: ["g1"],
      matchType: "include",
      isEnabled: true,
    },
    {
      id: "c3",
      type: "group-match",
      targetType: "role",
      targetId: "role-leader",
      groupIds: ["g1"],
      minCount: 1,
      isEnabled: true,
    },
  ],
  appSettings: {
    algorithm: "optimize",
    shuffleAnimation: "none",
    autoAssignAlgorithm: "right-top-down",
  },
  isViewMode: false,
});

describe("parseRosterCsv", () => {
  it("parses a UTF-8 BOM roster with required 名前", () => {
    const csv = "\uFEFF名前,ふりがな,性別\n山田,やまだ,男\n鈴木,すずき,女";
    const result = parseRosterCsv(csv);
    expect(result).toEqual({
      ok: true,
      skipped: 0,
      rows: [
        {
          name: "山田",
          attendanceNumber: 1,
          furigana: "やまだ",
          gender: "male",
          roleNames: [],
        },
        {
          name: "鈴木",
          attendanceNumber: 2,
          furigana: "すずき",
          gender: "female",
          roleNames: [],
        },
      ],
    });
  });

  it("skips blank 名前 rows and keeps the count", () => {
    const csv = "名前\n山田\n,\n鈴木";
    const result = parseRosterCsv(csv);
    expect(result).toEqual({
      ok: true,
      skipped: 1,
      rows: [
        {
          name: "山田",
          attendanceNumber: 1,
          gender: "other",
          roleNames: [],
        },
        {
          name: "鈴木",
          attendanceNumber: 2,
          gender: "other",
          roleNames: [],
        },
      ],
    });
  });

  it("returns zero-valid-rows when every name is empty", () => {
    expect(parseRosterCsv("名前\n\n ")).toEqual({
      ok: false,
      reason: "zero-valid-rows",
    });
  });

  it("returns missing-name-column without 名前", () => {
    expect(parseRosterCsv("attendanceNumber,name\n1,山田")).toEqual({
      ok: false,
      reason: "missing-name-column",
    });
  });
});

describe("applyRosterImport", () => {
  it("clears assignments, locks, and constraints while keeping geometry and groups", () => {
    const parsed = parseRosterCsv("名前,ロール\n山田,班長");
    expect(parsed).toEqual({
      ok: true,
      skipped: 0,
      rows: [
        {
          name: "山田",
          attendanceNumber: 1,
          gender: "other",
          roleNames: ["班長"],
        },
      ],
    });
    if (!parsed.ok) return;
    const state = baseState();
    const next = applyRosterImport(state, parsed);
    expect(next.students.map((s) => s.name)).toEqual(["山田"]);
    expect(next.students[0].roleIds).toEqual(["role-leader"]);
    expect(next.seats[0]).toEqual({
      id: "seat-1",
      x: 2,
      y: 3,
      groupIds: ["g1"],
      studentId: null,
      isLocked: false,
    });
    expect(next.constraints).toEqual([]);
    expect(state.groups).toEqual([{ id: "g1", name: "1班", color: "#FCA5A5" }]);
    expect(state.appSettings).toEqual({
      algorithm: "optimize",
      shuffleAnimation: "none",
      autoAssignAlgorithm: "right-top-down",
    });
    expect(state.objects[0].text).toBe("教卓");
  });
});
