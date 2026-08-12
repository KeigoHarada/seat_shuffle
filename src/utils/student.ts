import { Student } from "../types";

export const sortStudentsByNameLogic = (students: Student[]): Student[] => {
  const newStudents = [...students].sort((a, b) => {
    const aFuri = (a.furigana || "").trim();
    const bFuri = (b.furigana || "").trim();

    // 両方ともふりがなが設定されている場合
    if (aFuri && bFuri) {
      return aFuri.localeCompare(bFuri, "ja");
    }
    // どちらか一方だけふりがなが設定されている場合
    if (aFuri && !bFuri) return -1;
    if (!aFuri && bFuri) return 1;

    // 両方ふりがななしの場合は名前で比較
    return (a.name || "").trim().localeCompare((b.name || "").trim(), "ja");
  });

  return newStudents.map((s, i) => ({
    ...s,
    attendanceNumber: i + 1,
  }));
};
