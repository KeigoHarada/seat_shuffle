import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyRosterImport, parseRosterCsv } from "../roster";
import type { AppState } from "../../types/app";

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

  it("rejects the legacy settings dump because its first line has no 名前", () => {
    const legacy =
      "# Students\nattendanceNumber,name,furigana,gender,roles\n1,あ太郎,アタロウ,male,班長";
    expect(parseRosterCsv(legacy)).toEqual({
      ok: false,
      reason: "missing-name-column",
    });
  });

  it("reads 出席番号 and quoted ロール lists, falling back to row order", () => {
    const csv =
      '名前,出席番号,ロール\n山田,7,"班長|書記"\n鈴木,abc,\n"佐藤, 花",0,班長';
    expect(parseRosterCsv(csv)).toEqual({
      ok: true,
      skipped: 0,
      rows: [
        {
          name: "山田",
          attendanceNumber: 7,
          gender: "other",
          roleNames: ["班長", "書記"],
        },
        { name: "鈴木", attendanceNumber: 2, gender: "other", roleNames: [] },
        {
          name: "佐藤, 花",
          attendanceNumber: 3,
          gender: "other",
          roleNames: ["班長"],
        },
      ],
    });
  });

  it("loads the shipped sample roster", () => {
    const text = readFileSync(
      path.resolve(__dirname, "../../../sample_30_students.csv"),
      "utf8",
    );
    const result = parseRosterCsv(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows).toHaveLength(30);
    expect(result.skipped).toBe(0);
    expect(result.rows[0]).toEqual({
      name: "あ太郎",
      attendanceNumber: 1,
      furigana: "アタロウ",
      gender: "male",
      roleNames: ["班長"],
    });
    expect(result.rows[29]).toEqual({
      name: "そ花子",
      attendanceNumber: 30,
      furigana: "ソハナコ",
      gender: "female",
      roleNames: [],
    });
  });
});

describe("applyRosterImport", () => {
  it("clears assignments, locks, and constraints while keeping seat geometry", () => {
    const state = baseState();
    const groups = state.groups;
    const settings = state.appSettings;
    const objects = state.objects;
    const next = applyRosterImport(state, {
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
    expect(next.students.map((s) => s.name)).toEqual(["山田"]);
    expect(next.students[0].roleIds).toEqual(["role-leader"]);
    expect(next.roles).toEqual([
      { id: "role-leader", name: "班長", iconName: "Crown" },
    ]);
    expect(next.seats).toEqual([
      {
        id: "seat-1",
        x: 2,
        y: 3,
        groupIds: ["g1"],
        studentId: null,
        isLocked: false,
      },
    ]);
    expect(next.constraints).toEqual([]);
    expect(Object.keys(next).sort()).toEqual([
      "constraints",
      "roles",
      "seats",
      "students",
    ]);
    expect(state.groups).toBe(groups);
    expect(state.appSettings).toBe(settings);
    expect(state.objects).toBe(objects);
  });

  it("creates roles that the roster names but the classroom lacks", () => {
    const next = applyRosterImport(baseState(), {
      ok: true,
      skipped: 0,
      rows: [
        {
          name: "山田",
          attendanceNumber: 1,
          gender: "male",
          roleNames: ["班長", "書記"],
        },
        {
          name: "鈴木",
          attendanceNumber: 2,
          gender: "female",
          roleNames: ["書記"],
        },
      ],
    });
    const created = next.roles.find((r) => r.name === "書記");
    expect(created).toMatchObject({ name: "書記", iconName: "User" });
    expect(next.roles.map((r) => r.name)).toEqual(["班長", "書記"]);
    expect(next.students.map((s) => s.roleIds)).toEqual([
      ["role-leader", created?.id],
      [created?.id],
    ]);
  });
});
