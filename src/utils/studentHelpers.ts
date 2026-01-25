import { Student } from "../types";

/**
 * 生徒の出席番号を1から連番で再採番する
 * @param students 生徒配列
 * @returns 出席番号が再採番された生徒配列
 */
export const renumberStudents = (students: Student[]): Student[] => {
  return students.map((student, index) => ({
    ...student,
    studentNumber: index + 1,
  }));
};

/**
 * 生徒を出席番号順にソートする
 * @param students 生徒配列
 * @returns 出席番号順にソートされた生徒配列
 */
export const sortStudentsByNumber = (students: Student[]): Student[] => {
  return [...students].sort((a, b) => a.studentNumber - b.studentNumber);
};
