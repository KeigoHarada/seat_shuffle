import type { Student } from "../../types";

type SetState = (partial: unknown) => void;

export function createStudentSlice(set: SetState) {
  return {
    addStudent: (student: Student) => {
      set(
        (state: {
          students: Student[];
          currentLayout: {
            seats: { id: string; isEmpty: boolean; studentId?: string }[];
          } | null;
        }) => {
          if (!state.currentLayout) {
            throw new Error("レイアウトが設定されていません");
          }

          const unnamedSeats = state.currentLayout.seats.filter(
            (seat) => !seat.isEmpty && seat.studentId === undefined,
          );

          if (unnamedSeats.length === 0) {
            throw new Error("名無し席がありません。追加できません。");
          }

          const studentWithNumber = {
            ...student,
            studentNumber: state.students.length + 1,
            roleIds: student.roleIds ?? [],
          };

          const firstUnnamedSeat = unnamedSeats[0]!;
          const updatedSeats = state.currentLayout.seats.map((seat) =>
            seat.id === firstUnnamedSeat.id
              ? { ...seat, studentId: studentWithNumber.id, isEmpty: false }
              : seat,
          );

          return {
            students: [...state.students, studentWithNumber],
            currentLayout: {
              ...state.currentLayout,
              seats: updatedSeats,
            },
          };
        },
      );
    },

    removeStudent: (studentId: string) =>
      set(
        (state: {
          students: Student[];
          currentLayout: { seats: { studentId?: string }[] } | null;
        }) => {
          const updatedStudents = state.students.filter(
            (s) => s.id !== studentId,
          );
          const renumberedStudents = updatedStudents.map((s, i) => ({
            ...s,
            studentNumber: i + 1,
          }));
          return {
            students: renumberedStudents,
            currentLayout: state.currentLayout
              ? {
                  ...state.currentLayout,
                  seats: state.currentLayout.seats.map((seat) =>
                    seat.studentId === studentId
                      ? { ...seat, studentId: undefined }
                      : seat,
                  ),
                }
              : null,
          };
        },
      ),

    updateStudent: (studentId: string, updates: Partial<Student>) =>
      set((state: { students: Student[] }) => ({
        students: state.students.map((s) =>
          s.id === studentId ? { ...s, ...updates } : s,
        ),
      })),

    assignStudentToSeat: (studentId: string, seatId: string) =>
      set((state: { currentLayout: { seats: { id: string }[] } | null }) => {
        if (!state.currentLayout) return state;
        return {
          currentLayout: {
            ...state.currentLayout,
            seats: state.currentLayout.seats.map((seat) =>
              seat.id === seatId ? { ...seat, studentId } : seat,
            ),
          },
        };
      }),

    removeStudentFromSeat: (seatId: string) =>
      set(
        (state: {
          currentLayout: { seats: { id: string; studentId?: string }[] };
          students: Student[];
        }) => {
          if (!state.currentLayout) return state;
          const seatToRemove = state.currentLayout.seats.find(
            (s) => s.id === seatId,
          );
          const studentIdToRemove = seatToRemove?.studentId;
          const updatedLayout = {
            ...state.currentLayout,
            seats: state.currentLayout.seats.map((seat) =>
              seat.id === seatId ? { ...seat, studentId: undefined } : seat,
            ),
          };
          if (studentIdToRemove) {
            const updatedStudents = state.students.filter(
              (s) => s.id !== studentIdToRemove,
            );
            const renumberedStudents = updatedStudents.map((s, i) => ({
              ...s,
              studentNumber: i + 1,
            }));
            return {
              currentLayout: updatedLayout,
              students: renumberedStudents,
            };
          }
          return { currentLayout: updatedLayout };
        },
      ),

    clearAllStudents: () =>
      set(
        (state: {
          students: Student[];
          currentLayout: { seats: { studentId?: string }[] } | null;
        }) => ({
          students: [],
          currentLayout: state.currentLayout
            ? {
                ...state.currentLayout,
                seats: state.currentLayout.seats.map((seat) => ({
                  ...seat,
                  studentId: undefined,
                })),
              }
            : null,
        }),
      ),
  };
}
