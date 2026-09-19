import { describe, it, expect } from "vitest";
import { sortStudentsByNameLogic } from "../student";
import { Student } from "../../types/student";
import { createDefaultClassroomState } from "../../data/defaultData";

const mockStudent = (id: string, name: string, furigana?: string): Student => ({
  id,
  name,
  furigana,
  attendanceNumber: 0,
  gender: "other",
  roleIds: [],
});

describe("student service", () => {
  describe("sortStudentsByNameLogic", () => {
    it("should sort students with furigana alphabetically", () => {
      const students = [
        mockStudent("1", "佐藤", "さとう"),
        mockStudent("2", "伊藤", "いとう"),
        mockStudent("3", "加藤", "かとう"),
      ];

      const sorted = sortStudentsByNameLogic(students);

      expect(sorted[0].id).toBe("2");
      expect(sorted[1].id).toBe("3");
      expect(sorted[2].id).toBe("1");

      expect(sorted[0].attendanceNumber).toBe(1);
      expect(sorted[1].attendanceNumber).toBe(2);
      expect(sorted[2].attendanceNumber).toBe(3);
    });

    it("should place students without furigana at the end and sort them by name", () => {
      const students = [
        mockStudent("1", "B-Name"),
        mockStudent("2", "阿部", "あべ"),
        mockStudent("3", "A-Name"),
      ];

      const sorted = sortStudentsByNameLogic(students);

      expect(sorted[0].id).toBe("2");
      expect(sorted[1].id).toBe("3");
      expect(sorted[2].id).toBe("1");
    });

    it("should handle mixed furigana and missing furigana correctly", () => {
      const students = [
        mockStudent("1", "田中", "たなか"),
        mockStudent("2", "鈴木", "すずき"),
        mockStudent("3", "Zack"),
        mockStudent("4", "Alice"),
      ];

      const sorted = sortStudentsByNameLogic(students);

      expect(sorted[0].name).toBe("鈴木");
      expect(sorted[1].name).toBe("田中");
      expect(sorted[2].name).toBe("Alice");
      expect(sorted[3].name).toBe("Zack");
    });

    it("should ignore whitespace when sorting", () => {
      const students = [mockStudent("1", " B"), mockStudent("2", " A ")];

      const sorted = sortStudentsByNameLogic(students);
      expect(sorted[0].name).toBe(" A ");
      expect(sorted[1].name).toBe(" B");
    });

    it("should start with sample students intentionally not in attendance order, and sort them into 1..30 order", () => {
      const defaultState = createDefaultClassroomState();
      expect(
        defaultState.students.every((s, idx) => s.attendanceNumber === idx + 1),
      ).toBe(true);

      const sorted = sortStudentsByNameLogic(defaultState.students);

      expect(sorted).toHaveLength(30);
      expect(sorted[0].name).toBe("あ太郎");
      expect(sorted[0].attendanceNumber).toBe(1);
      expect(sorted[1].name).toBe("あ花子");
      expect(sorted[1].attendanceNumber).toBe(2);
      expect(sorted[28].name).toBe("そ太郎");
      expect(sorted[28].attendanceNumber).toBe(29);
      expect(sorted[29].name).toBe("そ花子");
      expect(sorted[29].attendanceNumber).toBe(30);

      for (let i = 0; i < 30; i++) {
        expect(sorted[i].attendanceNumber).toBe(i + 1);
      }
    });
  });
});
