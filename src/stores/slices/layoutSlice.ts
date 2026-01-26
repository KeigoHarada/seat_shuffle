import type { Seat, SeatLayout } from "../../types";
import {
  DEFAULT_LAYOUT_ROWS,
  DEFAULT_LAYOUT_COLS,
  DEFAULT_LAYOUT_NAME,
} from "../../constants/layout";
import { DEFAULT_GROUPS } from "../initialState";
import { SAMPLE_STUDENTS } from "../sampleData";
import { UI_CONSTANTS } from "../../constants/ui";

type SetState = (partial: unknown) => void;
type GetState = () => unknown;

const GROUP_IDS = DEFAULT_GROUPS.map((g) => g.id);

export function createLayoutSlice(set: SetState, get: GetState) {
  return {
    setCurrentLayout: (layout: SeatLayout) => set({ currentLayout: layout }),

    createLayout: (rows: number, cols: number, name: string) => {
      const seats: Seat[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          seats.push({
            id: `seat-${row}-${col}`,
            row,
            col,
            isEmpty: false,
            groupIds: [],
          });
        }
      }
      const layout: SeatLayout = {
        id: `layout-${Date.now()}`,
        name,
        rows,
        cols,
        seats,
        teacherDeskPosition: "top",
      };
      set({ currentLayout: layout });
    },

    toggleSeatEmpty: (seatId: string) =>
      set(
        (state: {
          currentLayout: {
            seats: { id: string; isEmpty: boolean; studentId?: string }[];
          };
          students: { id: string; studentNumber: number }[];
        }) => {
          if (!state.currentLayout) return state;
          const seatToToggle = state.currentLayout.seats.find(
            (s) => s.id === seatId,
          );
          const studentIdToRemove = seatToToggle?.studentId;
          const updatedLayout = {
            ...state.currentLayout,
            seats: state.currentLayout.seats.map((seat) =>
              seat.id === seatId
                ? { ...seat, isEmpty: !seat.isEmpty, studentId: undefined }
                : seat,
            ),
          };
          if (studentIdToRemove && !seatToToggle?.isEmpty) {
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

    initializeDefaultLayout: () => {
      const state = get() as { currentLayout: SeatLayout | null };
      if (state.currentLayout) return;

      (
        get() as { createLayout: (r: number, c: number, n: string) => void }
      ).createLayout(
        DEFAULT_LAYOUT_ROWS,
        DEFAULT_LAYOUT_COLS,
        DEFAULT_LAYOUT_NAME,
      );

      const layout = (get() as { currentLayout: SeatLayout | null })
        .currentLayout;
      if (layout) {
        const updatedSeats = layout.seats.map((seat) => {
          const { row, col } = seat;
          let assignedGroupId: string | null = null;
          if (row <= 1) {
            assignedGroupId = col <= 2 ? GROUP_IDS[0]! : GROUP_IDS[1]!;
          } else if (row <= 3) {
            assignedGroupId = col <= 2 ? GROUP_IDS[2]! : GROUP_IDS[3]!;
          } else if (row <= 5) {
            assignedGroupId = col <= 2 ? GROUP_IDS[4]! : GROUP_IDS[5]!;
          } else {
            assignedGroupId = GROUP_IDS[col % 6]!;
          }
          return {
            ...seat,
            groupIds: assignedGroupId ? [assignedGroupId] : [],
          };
        });
        set({
          currentLayout: { ...layout, seats: updatedSeats },
        });
      }

      const currentLayout = (get() as { currentLayout: SeatLayout | null })
        .currentLayout;
      if (currentLayout) {
        const allSeats = [...currentLayout.seats];
        const emptySeatsCount = 3;
        const unnamedSeatsCount = 2;
        const totalUnusedSeats = emptySeatsCount + unnamedSeatsCount;

        const shuffledStudents = [...SAMPLE_STUDENTS].sort(
          () => Math.random() - UI_CONSTANTS.LAYOUT.RANDOM_SORT_OFFSET,
        );
        const studentsToAdd = shuffledStudents.slice(
          0,
          shuffledStudents.length - totalUnusedSeats,
        );

        studentsToAdd.forEach((student) => {
          (
            get() as { addStudent: (s: (typeof SAMPLE_STUDENTS)[0]) => void }
          ).addStudent(student);
        });

        const emptySeats = allSeats
          .sort(() => Math.random() - UI_CONSTANTS.LAYOUT.RANDOM_SORT_OFFSET)
          .slice(0, emptySeatsCount);
        emptySeats.forEach((seat) => {
          (get() as { toggleSeatEmpty: (id: string) => void }).toggleSeatEmpty(
            seat.id,
          );
        });

        const unnamedSeats = allSeats
          .filter((s) => !emptySeats.some((e) => e.id === s.id))
          .sort(() => Math.random() - UI_CONSTANTS.LAYOUT.RANDOM_SORT_OFFSET)
          .slice(0, unnamedSeatsCount);

        const setLayout = (
          get() as { setCurrentLayout: (l: SeatLayout) => void }
        ).setCurrentLayout;
        unnamedSeats.forEach((seat) => {
          const { studentId, ...rest } = seat;
          const layout = (get() as { currentLayout: SeatLayout }).currentLayout;
          setLayout({
            ...layout,
            seats: layout.seats.map((s) => (s.id === seat.id ? rest : s)),
          });
        });

        const remainingSeats = allSeats.filter(
          (s) =>
            !emptySeats.some((e) => e.id === s.id) &&
            !unnamedSeats.some((u) => u.id === s.id),
        );
        const assign = (
          get() as {
            assignStudentToSeat: (sid: string, seatId: string) => void;
          }
        ).assignStudentToSeat;
        remainingSeats.forEach((seat, i) => {
          if (i < studentsToAdd.length) {
            assign(studentsToAdd[i]!.id, seat.id);
          }
        });
      }
    },
  };
}
