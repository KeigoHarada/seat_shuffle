import type { Role, Student } from "../../types";

type SetState = (partial: unknown) => void;

export function createRoleSlice(set: SetState) {
  return {
    addRole: (role: Role) =>
      set((state: { roles: Role[] }) => ({
        roles: [...state.roles, role],
      })),

    removeRole: (roleId: string) =>
      set((state: { roles: Role[]; students: Student[] }) => ({
        roles: state.roles.filter((r) => r.id !== roleId),
        students: state.students.map((s) => ({
          ...s,
          roleIds: s.roleIds.filter((id) => id !== roleId),
        })),
      })),

    updateRole: (roleId: string, updates: Partial<Role>) =>
      set((state: { roles: Role[] }) => ({
        roles: state.roles.map((r) =>
          r.id === roleId ? { ...r, ...updates } : r,
        ),
      })),

    assignRoleToStudent: (studentId: string, roleId: string) =>
      set((state: { students: Student[] }) => ({
        students: state.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                roleIds: [...s.roleIds.filter((id) => id !== roleId), roleId],
              }
            : s,
        ),
      })),

    removeRoleFromStudent: (studentId: string, roleId: string) =>
      set((state: { students: Student[] }) => ({
        students: state.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                roleIds: s.roleIds.filter((id) => id !== roleId),
              }
            : s,
        ),
      })),
  };
}
