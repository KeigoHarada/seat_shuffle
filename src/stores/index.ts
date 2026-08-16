import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AppState,
  Student,
  Role,
  Group,
  Seat,
  Constraint,
  AppSettings,
  CanvasObject,
} from "../types";
import { sortStudentsByNameLogic } from "../utils/student";
import {
  createDefaultClassroomState,
  createTourInitialState,
  createEmptyState,
} from "../constants/defaultData";

export interface StateAndActions extends AppState {
  // Global
  clearState: () => void;
  loadDefaultTemplate: () => void;
  loadTourInitialState: () => void;
  loadState: (state: Partial<AppState>) => void;
  isViewMode: boolean;
  setIsViewMode: (val: boolean) => void;

  // Students
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  removeStudent: (id: string) => void;
  reorderStudents: (startIndex: number, endIndex: number) => void;
  sortStudentsByName: () => void;

  // Roles
  addRole: (role: Role) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  removeRole: (id: string) => void;

  // Groups
  addGroup: (group: Group) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  removeGroup: (id: string) => void;

  // Seats
  addSeat: (seat: Seat) => void;
  updateSeat: (id: string, updates: Partial<Seat>) => void;
  removeSeat: (id: string) => void;
  setSeats: (seats: Seat[]) => void;
  pastSeats: Seat[][];
  saveSeatHistory: () => void;
  undoShuffle: () => void;

  // Objects
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;

  // Constraints
  addConstraint: (constraint: Constraint) => void;
  updateConstraint: (id: string, updates: Partial<Constraint>) => void;
  removeConstraint: (id: string) => void;

  // AppSettings
  updateAppSettings: (updates: Partial<AppSettings>) => void;
  canvasTool: "select" | "hand";
  setCanvasTool: (tool: "select" | "hand") => void;

  // UI State
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  activeSettingsTab: "students" | "roles" | "groups" | "constraints" | "global";
  setActiveSettingsTab: (
    tab: "students" | "roles" | "groups" | "constraints" | "global",
  ) => void;
  highlightedStudentId: string | null;
  setHighlightedStudentId: (id: string | null) => void;
  editingStudentId: string | null;
  setEditingStudentId: (id: string | null) => void;
  isShuffling: boolean;
  setIsShuffling: (isShuffling: boolean) => void;
}

const defaultClassroomData = createDefaultClassroomState();

const initialState: AppState & {
  pastSeats: Seat[][];
  canvasTool: "select" | "hand";
  isSettingsOpen: boolean;
  activeSettingsTab: "students" | "roles" | "groups" | "constraints" | "global";
  highlightedStudentId: string | null;
  editingStudentId: string | null;
  isShuffling: boolean;
} = {
  ...defaultClassroomData,
  isViewMode: false,
  canvasTool: "select",
  appSettings: {
    gridRows: 6,
    gridCols: 7,
    soundEnabled: true,
    theme: "system",
    algorithm: "optimize",
    shuffleAnimation: "none",
    autoAssignAlgorithm: "right-top-down",
  },
  isSettingsOpen: true,
  activeSettingsTab: "students",
  highlightedStudentId: null,
  editingStudentId: null,
  isShuffling: false,
};

export const useStore = create<StateAndActions>()(
  persist(
    (set) => ({
      ...initialState,

      clearState: () =>
        set((state) => ({
          ...state,
          ...createEmptyState(),
          highlightedStudentId: null,
          editingStudentId: null,
        })),
      loadDefaultTemplate: () =>
        set((state) => ({
          ...state,
          ...createDefaultClassroomState(),
          highlightedStudentId: null,
          editingStudentId: null,
        })),
      loadTourInitialState: () =>
        set((state) => ({
          ...state,
          ...createTourInitialState(),
          highlightedStudentId: null,
          editingStudentId: null,
          isViewMode: false,
          isSettingsOpen: true,
          activeSettingsTab: "students",
        })),
      loadState: (loaded) => set((state) => ({ ...state, ...loaded })),

      setIsViewMode: (val) => set({ isViewMode: val }),

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
            highlightedStudentId:
              state.highlightedStudentId === id
                ? null
                : state.highlightedStudentId,
            editingStudentId:
              state.editingStudentId === id ? null : state.editingStudentId,
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
      saveSeatHistory: () =>
        set((state) => ({
          pastSeats: [...state.pastSeats, state.seats],
        })),
      undoShuffle: () =>
        set((state) => {
          if (state.pastSeats.length === 0) return {};
          const newPastSeats = [...state.pastSeats];
          const previousSeats = newPastSeats.pop()!;
          return {
            seats: previousSeats,
            pastSeats: newPastSeats,
          };
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

      setCanvasTool: (tool) => set({ canvasTool: tool }),

      setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      setActiveSettingsTab: (tab) => set({ activeSettingsTab: tab }),
      setHighlightedStudentId: (id) => set({ highlightedStudentId: id }),
      setEditingStudentId: (id) => set({ editingStudentId: id }),
      setIsShuffling: (isShuffling) => set({ isShuffling }),
    }),
    {
      name: "seat-shuffle-storage",
    },
  ),
);
