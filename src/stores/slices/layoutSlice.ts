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

function getGroupIdsForPosition(row: number, col: number): string[] {
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
  return assignedGroupId ? [assignedGroupId] : [];
}

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
            studentId: undefined,
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

    updateLayoutSize: (newRows: number, newCols: number) => {
      type LayoutState = {
        currentLayout: SeatLayout | null;
        students: { id: string; studentNumber: number }[];
      };
      const state = get() as LayoutState;
      const layout = state.currentLayout;
      if (!layout) return;

      const oldRows = layout.rows;
      const oldCols = layout.cols;
      const seatById = new Map(layout.seats.map((s) => [s.id, s]));

      const studentIdsToRemove = new Set<string>();
      for (const seat of layout.seats) {
        if (seat.row >= newRows || seat.col >= newCols) {
          if (seat.studentId) studentIdsToRemove.add(seat.studentId);
        }
      }

      const newSeats: Seat[] = [];
      for (let row = 0; row < newRows; row++) {
        for (let col = 0; col < newCols; col++) {
          const id = `seat-${row}-${col}`;
          const existing = seatById.get(id);
          if (existing && row < oldRows && col < oldCols) {
            newSeats.push({ ...existing });
          } else {
            newSeats.push({
              id,
              row,
              col,
              studentId: undefined,
              isEmpty: false,
              groupIds: getGroupIdsForPosition(row, col),
            });
          }
        }
      }

      const updatedStudents = state.students
        .filter((s) => !studentIdsToRemove.has(s.id))
        .map((s, i) => ({ ...s, studentNumber: i + 1 }));

      set({
        currentLayout: {
          ...layout,
          rows: newRows,
          cols: newCols,
          seats: newSeats,
        },
        students: updatedStudents,
        previousLayout: null,
      });
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
            studentId: undefined,
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

        const shuffledForUnused = [...allSeats].sort(
          () => Math.random() - UI_CONSTANTS.LAYOUT.RANDOM_SORT_OFFSET,
        );
        const emptySeatIds = new Set(
          shuffledForUnused.slice(0, emptySeatsCount).map((s) => s.id),
        );
        const unnamedSeatIds = new Set(
          shuffledForUnused
            .slice(emptySeatsCount, emptySeatsCount + unnamedSeatsCount)
            .map((s) => s.id),
        );

        const seatsAfterUnused = currentLayout.seats.map((seat) => {
          if (emptySeatIds.has(seat.id)) {
            return { ...seat, isEmpty: true, studentId: undefined };
          }
          if (unnamedSeatIds.has(seat.id)) {
            return { ...seat, isEmpty: false, studentId: undefined };
          }
          return seat;
        });

        (
          get() as { setCurrentLayout: (l: SeatLayout) => void }
        ).setCurrentLayout({
          ...currentLayout,
          seats: seatsAfterUnused,
        });

        const shuffledStudents = [...SAMPLE_STUDENTS].sort(
          () => Math.random() - UI_CONSTANTS.LAYOUT.RANDOM_SORT_OFFSET,
        );
        const studentsToAdd = shuffledStudents.slice(
          0,
          Math.max(0, shuffledStudents.length - totalUnusedSeats),
        );

        studentsToAdd.forEach((student) => {
          (
            get() as { addStudent: (s: (typeof SAMPLE_STUDENTS)[0]) => void }
          ).addStudent(student);
        });
      }
    },
  };
}
