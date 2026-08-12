import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "../index";
import { Student } from "../../types";

describe("useStore", () => {
  beforeEach(() => {
    // Clear state before each test
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

  it("should remove a student", () => {
    const student: Student = {
      id: "s1",
      name: "John Doe",
      gender: "male",
      attendanceNumber: 1,
      roleIds: [],
    };
    useStore.getState().addStudent(student);

    useStore.getState().removeStudent("s1");

    const students = useStore.getState().students;
    expect(students).toHaveLength(0);
  });

  it("should update app settings", () => {
    useStore.getState().updateAppSettings({ theme: "dark" });

    const settings = useStore.getState().appSettings;
    expect(settings.theme).toBe("dark");
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
  });
});
