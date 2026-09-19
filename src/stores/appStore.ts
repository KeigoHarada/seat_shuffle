import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState } from "../types/app";
import type { StateAndActions } from "../types/store";
import type { UndoSnapshot } from "../types/history";
import { sortStudentsByNameLogic } from "../services/student";
import {
  createDefaultClassroomState,
  createTourInitialState,
  createEmptyState,
} from "../data/defaultData";
import { applyRosterImport } from "../services/roster";
import { applyProjectBackup } from "../services/backup";
import {
  appendUndoSnapshot,
  applyUndoSnapshot,
  captureUndoSnapshot,
  readPersistedUndoStack,
} from "../services/undo";

export type { StateAndActions };

const defaultClassroomData = createDefaultClassroomState();

const initialState: AppState & {
  undoStack: UndoSnapshot[];
} = {
  ...defaultClassroomData,
  appSettings: {
    algorithm: "optimize",
    shuffleAnimation: "none",
    autoAssignAlgorithm: "right-top-down",
  },
};

export const useStore = create<StateAndActions>()(
  persist(
    (set) => ({
      ...initialState,

      clearState: () =>
        set((state) => ({
          ...state,
          ...createEmptyState(),
        })),
      loadDefaultTemplate: () =>
        set((state) => ({
          ...state,
          ...createDefaultClassroomState(),
        })),
      loadTourInitialState: () =>
        set((state) => ({
          ...state,
          ...createTourInitialState(),
        })),
      loadState: (loaded) => set((state) => ({ ...state, ...loaded })),
      importRoster: (parsed) =>
        set((state) => ({
          ...applyRosterImport(state, parsed),
          undoStack: [],
        })),
      replaceProject: (snapshot) =>
        set((state) => ({
          ...state,
          ...applyProjectBackup(snapshot),
          undoStack: [],
        })),

      addStudent: (student) =>
        set((state) => ({ students: [...state.students, student] })),
      updateStudent: (id, updates) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        })),
      removeStudent: (id) =>
        set((state) => {
          const filtered = state.students.filter((s) => s.id !== id);
          return {
            students: filtered.map((s, i) => ({
              ...s,
              attendanceNumber: i + 1,
            })),
            seats: state.seats.map((seat) =>
              seat.studentId === id ? { ...seat, studentId: null } : seat,
            ),
            constraints: state.constraints.filter((c) => {
              if (c.type === "student-student") {
                return c.studentId1 !== id && c.studentId2 !== id;
              }
              if (c.type === "student-group") {
                return c.studentId !== id;
              }
              return true;
            }),
          };
        }),
      reorderStudents: (startIndex, endIndex) =>
        set((state) => {
          const newStudents = Array.from(state.students);
          const [removed] = newStudents.splice(startIndex, 1);
          newStudents.splice(endIndex, 0, removed);
          return {
            students: newStudents.map((s, i) => ({
              ...s,
              attendanceNumber: i + 1,
            })),
          };
        }),
      sortStudentsByName: () =>
        set((state) => ({
          students: sortStudentsByNameLogic(state.students),
        })),

      addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
      updateRole: (id, updates) =>
        set((state) => ({
          roles: state.roles.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),
      removeRole: (id) =>
        set((state) => ({
          roles: state.roles.filter((r) => r.id !== id),
          students: state.students.map((s) => ({
            ...s,
            roleIds: s.roleIds.filter((rId) => rId !== id),
          })),
          constraints: state.constraints.filter(
            (c) =>
              !(
                c.type === "group-match" &&
                c.targetType === "role" &&
                c.targetId === id
              ),
          ),
        })),

      addGroup: (group) =>
        set((state) => ({ groups: [...state.groups, group] })),
      updateGroup: (id, updates) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? { ...g, ...updates } : g,
          ),
        })),
      removeGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
          seats: state.seats.map((seat) => ({
            ...seat,
            groupIds: seat.groupIds.filter((gId) => gId !== id),
          })),
          constraints: state.constraints
            .map((c) => {
              if (c.type === "student-group" || c.type === "group-match") {
                return {
                  ...c,
                  groupIds: c.groupIds.filter((gId) => gId !== id),
                };
              }
              return c;
            })
            .filter((c) => {
              if (c.type === "student-group" || c.type === "group-match") {
                return c.groupIds.length > 0;
              }
              return true;
            }),
        })),

      addSeat: (seat) => set((state) => ({ seats: [...state.seats, seat] })),
      updateSeat: (id, updates) =>
        set((state) => ({
          seats: state.seats.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        })),
      removeSeat: (id) =>
        set((state) => ({
          seats: state.seats.filter((s) => s.id !== id),
        })),
      setSeats: (seats) => set({ seats }),
      pushUndo: () =>
        set((state) => {
          const snapshot = captureUndoSnapshot(state);
          const undoStack = appendUndoSnapshot(state.undoStack, snapshot);
          if (undoStack === state.undoStack) return {};
          return { undoStack };
        }),
      undo: () =>
        set((state) => {
          if (state.undoStack.length === 0) return {};
          const snapshot = state.undoStack[state.undoStack.length - 1];
          const undoStack = state.undoStack.slice(0, -1);
          const restored = applyUndoSnapshot(snapshot, {
            studentIds: new Set(state.students.map((student) => student.id)),
            groupIds: new Set(state.groups.map((group) => group.id)),
          });
          return { ...restored, undoStack };
        }),

      addObject: (obj) =>
        set((state) => ({ objects: [...state.objects, obj] })),
      updateObject: (id, updates) =>
        set((state) => ({
          objects: state.objects.map((o) =>
            o.id === id ? { ...o, ...updates } : o,
          ),
        })),
      removeObject: (id) =>
        set((state) => ({
          objects: state.objects.filter((o) => o.id !== id),
        })),

      addConstraint: (constraint) =>
        set((state) => ({ constraints: [...state.constraints, constraint] })),
      updateConstraint: (id, updates) =>
        set((state) => ({
          constraints: state.constraints.map((c) =>
            c.id === id ? ({ ...c, ...updates } as any) : c,
          ),
        })),
      removeConstraint: (id) =>
        set((state) => ({
          constraints: state.constraints.filter((c) => c.id !== id),
        })),

      updateAppSettings: (updates) =>
        set((state) => ({
          appSettings: { ...state.appSettings, ...updates },
        })),
    }),
    {
      name: "seat-shuffle-storage",
      merge: (persistedState, currentState) => {
        const persisted =
          persistedState && typeof persistedState === "object"
            ? (persistedState as Record<string, unknown>)
            : {};
        const rest = { ...persisted };
        delete rest.pastSeats;
        return {
          ...currentState,
          ...(rest as Partial<typeof currentState>),
          undoStack: readPersistedUndoStack(persisted),
        };
      },
    },
  ),
);
