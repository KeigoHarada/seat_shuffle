import type { Student } from "../../types";

type SetState = (partial: unknown) => void;
type GetState = () => unknown;

export function createSeatInteractionSlice(set: SetState, get: GetState) {
  return {
    setSelectedSeatId: (seatId: string | null) =>
      set({ selectedSeatId: seatId }),

    swapSeats: (seatId1: string, seatId2: string) =>
      set(
        (state: {
          currentLayout: {
            seats: {
              id: string;
              studentId?: string;
              isEmpty: boolean;
              [k: string]: unknown;
            }[];
          };
        }) => {
          if (!state.currentLayout) return state;
          const seat1 = state.currentLayout.seats.find((s) => s.id === seatId1);
          const seat2 = state.currentLayout.seats.find((s) => s.id === seatId2);
          if (!seat1 || !seat2) return state;
          return {
            currentLayout: {
              ...state.currentLayout,
              seats: state.currentLayout.seats.map((seat) => {
                if (seat.id === seatId1) {
                  return {
                    ...seat,
                    studentId: seat2.studentId,
                    isEmpty: seat2.isEmpty,
                  };
                }
                if (seat.id === seatId2) {
                  return {
                    ...seat,
                    studentId: seat1.studentId,
                    isEmpty: seat1.isEmpty,
                  };
                }
                return seat;
              }),
            },
            selectedSeatId: null,
          };
        },
      ),

    assignStudentNameToSeat: (seatId: string, studentName: string, furigana?: string) => {
      const state = get() as {
        currentLayout: {
          seats: { id: string; studentId?: string; isEmpty: boolean }[];
        } | null;
        students: Student[];
        updateStudent: (id: string, updates: Partial<Student>) => void;
        removeStudentFromSeat: (seatId: string) => void;
      };
      if (!state.currentLayout) return;

      if (!studentName.trim()) {
        state.removeStudentFromSeat(seatId);
        return;
      }

      const seat = state.currentLayout.seats.find((s) => s.id === seatId);
      if (!seat) return;

      if (seat.studentId) {
        const currentStudent = state.students.find(
          (s) => s.id === seat.studentId,
        );
        if (currentStudent) {
          state.updateStudent(seat.studentId, { 
            name: studentName,
            furigana: furigana ?? currentStudent.furigana
          });
          return;
        }
      }

      const student: Student = {
        id: `student-${Date.now()}`,
        name: studentName,
        furigana: furigana ?? "",
        gender: "other",
        studentNumber: state.students.length + 1,
        roleIds: [],
      };
      set((s: { students: Student[] }) => ({
        students: [...s.students, student],
      }));

      set((s: {
        currentLayout: {
          seats: { id: string; studentId?: string; isEmpty: boolean }[];
        } | null;
      }) => ({
        currentLayout: s.currentLayout
          ? {
              ...s.currentLayout,
              seats: s.currentLayout.seats.map((seat) =>
                seat.id === seatId
                  ? { ...seat, studentId: student!.id, isEmpty: false }
                  : seat,
              ),
            }
          : null,
      }));
    },
  };
}
