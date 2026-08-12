import { describe, it, expect } from "vitest";
import { sortStudentsByNameLogic } from "../student";
import { Student } from "../../types";

const mockStudent = (id: string, name: string, furigana?: string): Student => ({
  id,
  name,
  furigana,
  attendanceNumber: 0, // will be overwritten
  gender: "other",
  roleIds: [],
});

describe("student utils", () => {
  describe("sortStudentsByNameLogic", () => {
    it("should sort students with furigana alphabetically", () => {
      const students = [
        mockStudent("1", "佐藤", "さとう"),
        mockStudent("2", "伊藤", "いとう"),
        mockStudent("3", "加藤", "かとう"),
      ];

      const sorted = sortStudentsByNameLogic(students);

      expect(sorted[0].id).toBe("2"); // いとう
      expect(sorted[1].id).toBe("3"); // かとう
      expect(sorted[2].id).toBe("1"); // さとう

      // Attendance number should be updated correctly
      expect(sorted[0].attendanceNumber).toBe(1);
      expect(sorted[1].attendanceNumber).toBe(2);
      expect(sorted[2].attendanceNumber).toBe(3);
    });

    it("should place students without furigana at the end and sort them by name", () => {
      const students = [
        mockStudent("1", "B-Name"), // no furigana
        mockStudent("2", "阿部", "あべ"),
        mockStudent("3", "A-Name"), // no furigana
      ];

      const sorted = sortStudentsByNameLogic(students);

      expect(sorted[0].id).toBe("2"); // あべ (has furigana)
      expect(sorted[1].id).toBe("3"); // A-Name (no furigana, sorted by name)
      expect(sorted[2].id).toBe("1"); // B-Name (no furigana)
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
  });
});
