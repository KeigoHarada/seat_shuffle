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
} from "../types";

export interface StateAndActions extends AppState {
  // Global
  clearState: () => void;
  isViewMode: boolean;
  setIsViewMode: (val: boolean) => void;

  // Students
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  removeStudent: (id: string) => void;

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

  // Constraints
  addConstraint: (constraint: Constraint) => void;
  updateConstraint: (id: string, updates: Partial<Constraint>) => void;
  removeConstraint: (id: string) => void;

  // AppSettings
  updateAppSettings: (updates: Partial<AppSettings>) => void;
}

const initialState: AppState = {
  students: [],
  roles: [],
  groups: [],
  seats: [],
  constraints: [],
  isViewMode: false,
  appSettings: {
    gridRows: 6,
    gridCols: 7,
    soundEnabled: true,
    theme: "system",
  },
};

export const useStore = create<StateAndActions>()(
  persist(
    (set) => ({
      ...initialState,

      clearState: () => set(initialState),

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
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
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

      addConstraint: (constraint) =>
        set((state) => ({ constraints: [...state.constraints, constraint] })),
      updateConstraint: (id, updates) =>
        set((state) => ({
          constraints: state.constraints.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
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
    },
  ),
);
