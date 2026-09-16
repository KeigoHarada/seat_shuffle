import { Student } from "../types";

export const sortStudentsByNameLogic = (students: Student[]): Student[] => {
  const newStudents = [...students].sort((a, b) => {
    const aFuri = (a.furigana || "").trim();
    const bFuri = (b.furigana || "").trim();

    if (aFuri && bFuri) {
      return aFuri.localeCompare(bFuri, "ja");
    }
    if (aFuri && !bFuri) return -1;
    if (!aFuri && bFuri) return 1;

    return (a.name || "").trim().localeCompare((b.name || "").trim(), "ja");
  });

  return newStudents.map((s, i) => ({
    ...s,
    attendanceNumber: i + 1,
  }));
};
