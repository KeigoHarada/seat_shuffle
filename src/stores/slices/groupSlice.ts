import type { Group } from "../../types";

type SetState = (partial: unknown) => void;

export function createGroupSlice(set: SetState) {
  return {
    addGroup: (group: Group) =>
      set((state: { groups: Group[] }) => ({
        groups: [...state.groups, group],
      })),

    removeGroup: (groupId: string) =>
      set(
        (state: {
          groups: Group[];
          currentLayout: { seats: { groupIds: string[] }[] } | null;
        }) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
          currentLayout: state.currentLayout
            ? {
                ...state.currentLayout,
                seats: state.currentLayout.seats.map((seat) => ({
                  ...seat,
                  groupIds: seat.groupIds.filter((gid) => gid !== groupId),
                })),
              }
            : null,
        }),
      ),

    updateGroup: (groupId: string, updates: Partial<Group>) =>
      set((state: { groups: Group[] }) => ({
        groups: state.groups.map((g) =>
          g.id === groupId ? { ...g, ...updates } : g,
        ),
      })),

    toggleGroupOnSeat: (seatId: string, groupId: string) =>
      set(
        (state: {
          currentLayout: { seats: { id: string; groupIds: string[] }[] };
        }) => {
          if (!state.currentLayout) return state;
          return {
            currentLayout: {
              ...state.currentLayout,
              seats: state.currentLayout.seats.map((seat) => {
                if (seat.id !== seatId) return seat;
                const hasGroup = seat.groupIds.includes(groupId);
                return {
                  ...seat,
                  groupIds: hasGroup
                    ? seat.groupIds.filter((gid) => gid !== groupId)
                    : [...seat.groupIds, groupId],
                };
              }),
            },
          };
        },
      ),
  };
}
