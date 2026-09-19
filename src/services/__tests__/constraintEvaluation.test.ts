import { describe, expect, it } from "vitest";
import {
  evaluateConstraint,
  evaluateStudentStudentConstraint,
  evaluateStudentGroupConstraint,
} from "../constraintEvaluation";
import type { Seat } from "../../types/seat";
import type { Student } from "../../types/student";
import type {
  StudentStudentConstraint,
  StudentGroupConstraint,
} from "../../types/constraint";

const mockSeat = (
  id: string,
  studentId: string | null = null,
  groupIds: string[] = [],
): Seat => ({
  id,
  x: 0,
  y: 0,
  studentId,
  groupIds,
  isLocked: false,
});

const mockStudent = (id: string): Student => ({
  id,
  name: id,
  gender: "male",
  attendanceNumber: 1,
  roleIds: [],
});

describe("constraintEvaluation", () => {
  describe("evaluateStudentStudentConstraint", () => {
    it("evaluates close match correctly", () => {
      const constraint: StudentStudentConstraint = {
        id: "c1",
        type: "student-student",
        studentId1: "s1",
        studentId2: "s2",
        matchType: "close",
        isEnabled: true,
      };

      const seatsSharingGroup = [
        mockSeat("seat1", "s1", ["group-1"]),
        mockSeat("seat2", "s2", ["group-1"]),
      ];
      expect(evaluateStudentStudentConstraint(constraint, seatsSharingGroup)).toBe(true);

      const seatsDifferentGroup = [
        mockSeat("seat1", "s1", ["group-1"]),
        mockSeat("seat2", "s2", ["group-2"]),
      ];
      expect(evaluateStudentStudentConstraint(constraint, seatsDifferentGroup)).toBe(false);
    });

    it("returns null if any student is not seated", () => {
      const constraint: StudentStudentConstraint = {
        id: "c1",
        type: "student-student",
        studentId1: "s1",
        studentId2: "s2",
        matchType: "close",
        isEnabled: true,
      };

      const seatsOnlyS1 = [mockSeat("seat1", "s1", ["group-1"])];
      expect(evaluateStudentStudentConstraint(constraint, seatsOnlyS1)).toBeNull();
    });
  });

  describe("evaluateStudentGroupConstraint", () => {
    it("evaluates include match correctly", () => {
      const constraint: StudentGroupConstraint = {
        id: "c2",
        type: "student-group",
        studentId: "s1",
        groupIds: ["group-vision"],
        matchType: "include",
        isEnabled: true,
      };

      const inGroup = [mockSeat("seat1", "s1", ["group-vision"])];
      expect(evaluateStudentGroupConstraint(constraint, inGroup)).toBe(true);

      const notInGroup = [mockSeat("seat1", "s1", ["group-1"])];
      expect(evaluateStudentGroupConstraint(constraint, notInGroup)).toBe(false);
    });
  });

  describe("evaluateConstraint", () => {
    it("returns true for disabled constraints", () => {
      const constraint: StudentStudentConstraint = {
        id: "c1",
        type: "student-student",
        studentId1: "s1",
        studentId2: "s2",
        matchType: "close",
        isEnabled: false,
      };

      expect(evaluateConstraint(constraint, [], [])).toBe(true);
    });

    it("evaluates group-match constraint correctly", () => {
      const constraint = {
        id: "c3",
        type: "group-match" as const,
        targetType: "gender" as const,
        targetId: "male",
        groupIds: ["group-1"],
        minCount: 1,
        isEnabled: true,
      };

      const students = [mockStudent("s1")];
      const seats = [mockSeat("seat1", "s1", ["group-1"])];
      expect(evaluateConstraint(constraint, seats, students)).toBe(true);
    });
  });
});
