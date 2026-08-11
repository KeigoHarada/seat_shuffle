import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Student, Role, Group, Seat, Constraint, AppSettings } from "../types";

interface State {
  students: Student[];
  roles: Role[];
  groups: Group[];
  seats: Seat[];
  constraints: Constraint[];
  appSettings: AppSettings;
}

interface Actions {
  // Student
  addStudent: (student: Student) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  removeStudent: (id: string) => void;

  // Role
  addRole: (role: Role) => void;
  updateRole: (id: string, data: Partial<Role>) => void;
  removeRole: (id: string) => void;

  // Group
  addGroup: (group: Group) => void;
  updateGroup: (id: string, data: Partial<Group>) => void;
  removeGroup: (id: string) => void;

  // Seat
  addSeat: (seat: Seat) => void;
  updateSeat: (id: string, data: Partial<Seat>) => void;
  removeSeat: (id: string) => void;
  setSeats: (seats: Seat[]) => void;

  // Constraint
  addConstraint: (constraint: Constraint) => void;
  updateConstraint: (id: string, data: Partial<Constraint>) => void;
  removeConstraint: (id: string) => void;

  // AppSettings
  updateAppSettings: (data: Partial<AppSettings>) => void;
}

const initialState: State = {
  students: [],
  roles: [],
  groups: [],
  seats: [],
  constraints: [],
  appSettings: {
    viewMode: "edit",
    perspective: "teacher",
  },
};

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,

      addStudent: (student) =>
        set((state) => ({ students: [...state.students, student] })),
      updateStudent: (id, data) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...data } : s,
          ),
        })),
      removeStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),

      addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
      updateRole: (id, data) =>
        set((state) => ({
          roles: state.roles.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),
      removeRole: (id) =>
        set((state) => ({
          roles: state.roles.filter((r) => r.id !== id),
        })),

      addGroup: (group) =>
        set((state) => ({ groups: [...state.groups, group] })),
      updateGroup: (id, data) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? { ...g, ...data } : g,
          ),
        })),
      removeGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
        })),

      addSeat: (seat) => set((state) => ({ seats: [...state.seats, seat] })),
      updateSeat: (id, data) =>
        set((state) => ({
          seats: state.seats.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),
      removeSeat: (id) =>
        set((state) => ({
          seats: state.seats.filter((s) => s.id !== id),
        })),
      setSeats: (seats) => set({ seats }),

      addConstraint: (constraint) =>
        set((state) => ({ constraints: [...state.constraints, constraint] })),
      updateConstraint: (id, data) =>
        set((state) => ({
          constraints: state.constraints.map((c) =>
            c.id === id ? { ...c, ...data } : c,
          ) as Constraint[],
        })),
      removeConstraint: (id) =>
        set((state) => ({
          constraints: state.constraints.filter((c) => c.id !== id),
        })),

      updateAppSettings: (data) =>
        set((state) => ({ appSettings: { ...state.appSettings, ...data } })),
    }),
    {
      name: "seat-shuffle-storage",
    },
  ),
);
