import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "./index";

describe("useStore", () => {
  beforeEach(() => {
    useStore.setState({
      students: [],
      roles: [],
      groups: [],
      seats: [],
      constraints: [],
      appSettings: { viewMode: "edit", perspective: "teacher" },
    });
  });

  it("should add a student", () => {
    const store = useStore.getState();
    store.addStudent({
      id: "s1",
      attendanceNumber: 1,
      name: "山田太郎",
      furigana: "やまだたろう",
      gender: "male",
      roleIds: [],
      groupIds: [],
    });

    expect(useStore.getState().students).toHaveLength(1);
    expect(useStore.getState().students[0].name).toBe("山田太郎");
  });

  it("should update a student", () => {
    const store = useStore.getState();
    store.addStudent({
      id: "s1",
      attendanceNumber: 1,
      name: "山田太郎",
      furigana: "やまだたろう",
      gender: "male",
      roleIds: [],
      groupIds: [],
    });

    useStore.getState().updateStudent("s1", { name: "鈴木一郎" });
    expect(useStore.getState().students[0].name).toBe("鈴木一郎");
  });

  it("should remove a student", () => {
    const store = useStore.getState();
    store.addStudent({
      id: "s1",
      attendanceNumber: 1,
      name: "山田太郎",
      furigana: "やまだたろう",
      gender: "male",
      roleIds: [],
      groupIds: [],
    });

    useStore.getState().removeStudent("s1");
    expect(useStore.getState().students).toHaveLength(0);
  });

  it("should manage appSettings", () => {
    const store = useStore.getState();
    store.updateAppSettings({ perspective: "student" });
    expect(useStore.getState().appSettings.perspective).toBe("student");
    expect(useStore.getState().appSettings.viewMode).toBe("edit"); // Should preserve other keys
  });
});
