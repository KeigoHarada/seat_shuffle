import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "../index";
import { Student } from "../../types";

describe("useStore", () => {
  beforeEach(() => {
    useStore.getState().clearState();
  });

  it("should add a student", () => {
    const student: Student = {
      id: "s1",
      name: "John Doe",
      gender: "male",
      attendanceNumber: 1,
      roleIds: [],
    };

    useStore.getState().addStudent(student);

    const students = useStore.getState().students;
    expect(students).toHaveLength(1);
    expect(students[0]).toEqual(student);
  });

  it("should update a student", () => {
    const student: Student = {
      id: "s1",
      name: "John Doe",
      gender: "male",
      attendanceNumber: 1,
      roleIds: [],
    };
    useStore.getState().addStudent(student);

    useStore.getState().updateStudent("s1", { name: "Jane Doe" });

    const updated = useStore.getState().students[0];
    expect(updated.name).toBe("Jane Doe");
    expect(updated.gender).toBe("male");
  });

  it("should remove a student and clean up seat assignments and constraints", () => {
    const student: Student = {
      id: "s1",
      name: "John Doe",
      gender: "male",
      attendanceNumber: 1,
      roleIds: [],
    };
    useStore.getState().addStudent(student);
    useStore.getState().addSeat({
      id: "seat-1",
      x: 0,
      y: 0,
      studentId: "s1",
      groupIds: [],
      isLocked: false,
    });
    useStore.getState().addConstraint({
      id: "c1",
      type: "student-group",
      studentId: "s1",
      groupIds: ["group-1"],
      matchType: "include",
      isEnabled: true,
    });

    useStore.getState().removeStudent("s1");

    const state = useStore.getState();
    expect(state.students).toHaveLength(0);
    expect(state.seats.find((s) => s.id === "seat-1")?.studentId).toBeNull();
    expect(state.constraints.find((c) => c.id === "c1")).toBeUndefined();
  });

  it("should remove a role and clean up student roleIds and role constraints", () => {
    useStore.getState().addRole({
      id: "role-1",
      name: "係",
      iconName: "Star",
    });
    useStore.getState().addStudent({
      id: "s1",
      name: "John Doe",
      gender: "male",
      attendanceNumber: 1,
      roleIds: ["role-1"],
    });

    useStore.getState().removeRole("role-1");

    const state = useStore.getState();
    expect(state.roles).toHaveLength(0);
    expect(state.students[0].roleIds).toEqual([]);
  });

  it("should remove a group and clean up seat groupIds and group constraints", () => {
    useStore.getState().addGroup({
      id: "g1",
      name: "1班",
      color: "#FCA5A5",
    });
    useStore.getState().addSeat({
      id: "seat-1",
      x: 0,
      y: 0,
      studentId: null,
      groupIds: ["g1"],
      isLocked: false,
    });

    useStore.getState().removeGroup("g1");

    const state = useStore.getState();
    expect(state.groups).toHaveLength(0);
    expect(state.seats[0].groupIds).toEqual([]);
  });

  it("should update app settings", () => {
    useStore.getState().updateAppSettings({ algorithm: "random" });

    const settings = useStore.getState().appSettings;
    expect(settings.algorithm).toBe("random");
  });

  it("should clear state", () => {
    useStore.getState().addStudent({
      id: "s1",
      name: "John Doe",
      gender: "male",
      attendanceNumber: 1,
      roleIds: [],
    });

    useStore.getState().clearState();

    const state = useStore.getState();
    expect(state.students).toHaveLength(0);
    expect(state.seats).toHaveLength(0);
    expect(state.objects).toHaveLength(0);
    expect(state.roles).toHaveLength(0);
    expect(state.groups).toHaveLength(0);
  });

  it("should load default template (30 students, 30 paired seats, teacher desk)", () => {
    useStore.getState().loadDefaultTemplate();

    const state = useStore.getState();
    expect(state.students).toHaveLength(30);
    expect(
      state.students.every((s, idx) => s.attendanceNumber === idx + 1),
    ).toBe(true);
    const studentNames = state.students.map((s) => s.name);
    expect(studentNames).toContain("あ太郎");
    expect(studentNames).toContain("あ花子");
    expect(studentNames).toContain("そ花子");
    expect(state.seats).toHaveLength(30);
    expect(state.roles).toHaveLength(2);
    expect(state.groups).toHaveLength(7);
    expect(state.objects).toHaveLength(1);
    expect(state.objects[0].text).toBe("教卓");
    expect(state.constraints).toHaveLength(5);

    const ssConstraint = state.constraints.find(
      (c) => c.type === "student-student",
    );
    expect(ssConstraint).toBeDefined();
    if (ssConstraint && ssConstraint.type === "student-student") {
      expect(ssConstraint.studentId1).toBe("student-6");
      expect(ssConstraint.studentId2).toBe("student-19");

      expect(ssConstraint.matchType).toBe("far");
    }

    const leaderConstraint = state.constraints.find(
      (c) =>
        c.type === "group-match" &&
        c.targetType === "role" &&
        c.targetId === "role-leader",
    );
    expect(leaderConstraint).toBeDefined();
    if (leaderConstraint && leaderConstraint.type === "group-match") {
      expect(leaderConstraint.minCount).toBe(1);
      expect(leaderConstraint.groupIds).toHaveLength(6);
    }

    const visionConstraint = state.constraints.find(
      (c) => c.type === "student-group",
    );
    expect(visionConstraint).toBeDefined();
    if (visionConstraint && visionConstraint.type === "student-group") {
      expect(visionConstraint.studentId).toBe("student-28");
      expect(visionConstraint.groupIds).toEqual(["group-vision"]);
    }

    const visionSeats = state.seats.filter((s) =>
      s.groupIds.includes("group-vision"),
    );
    expect(visionSeats).toHaveLength(6);
    visionSeats.forEach((s) => expect(s.y).toBe(0));

    const distinctX = Array.from(new Set(state.seats.map((s) => s.x))).sort(
      (a, b) => a - b,
    );
    expect(distinctX).toEqual([0, 6, 14, 20, 28, 34]);
  });

  it("importRoster clears assignments and constraints and keeps groups and geometry", () => {
    useStore.getState().loadDefaultTemplate();
    const before = useStore.getState();
    const groupSnapshot = before.groups.map((g) => ({ ...g }));
    const settingsSnapshot = { ...before.appSettings };
    const seatGeometry = before.seats.map((s) => ({
      id: s.id,
      x: s.x,
      y: s.y,
      groupIds: [...s.groupIds],
    }));
    expect(before.seats.some((s) => s.studentId !== null)).toBe(true);
    expect(before.constraints.length).toBeGreaterThan(0);

    useStore.getState().importRoster({
      ok: true,
      skipped: 1,
      rows: [
        {
          name: "山田",
          attendanceNumber: 1,
          gender: "male",
          roleNames: [],
        },
      ],
    });

    const after = useStore.getState();
    expect(after.students.map((s) => s.name)).toEqual(["山田"]);
    expect(after.seats.every((s) => s.studentId === null)).toBe(true);
    expect(after.seats.every((s) => s.isLocked === false)).toBe(true);
    expect(after.constraints).toEqual([]);
    expect(after.groups).toEqual(groupSnapshot);
    expect(after.appSettings).toEqual(settingsSnapshot);
    expect(
      after.seats.map((s) => ({
        id: s.id,
        x: s.x,
        y: s.y,
        groupIds: s.groupIds,
      })),
    ).toEqual(seatGeometry);
  });

  it("replaceProject restores seated assignments from a snapshot", () => {
    useStore.getState().clearState();
    const snapshot = {
      version: 1 as const,
      students: [
        {
          id: "s1",
          name: "山田",
          gender: "male" as const,
          attendanceNumber: 1,
          roleIds: [] as string[],
        },
      ],
      roles: [],
      groups: [{ id: "g1", name: "1班", color: "#FCA5A5" }],
      seats: [
        {
          id: "seat-1",
          studentId: "s1",
          groupIds: ["g1"],
          x: 4,
          y: 5,
          isLocked: true,
        },
      ],
      objects: [],
      constraints: [],
      appSettings: {
        algorithm: "random" as const,
        shuffleAnimation: "confetti" as const,
        autoAssignAlgorithm: "left-top-down" as const,
      },
    };
    useStore.getState().replaceProject(snapshot);
    const after = useStore.getState();
    expect(after.students[0].name).toBe("山田");
    expect(after.seats[0].studentId).toBe("s1");
    expect(after.seats[0].isLocked).toBe(true);
    expect(after.appSettings.algorithm).toBe("random");
  });
});
