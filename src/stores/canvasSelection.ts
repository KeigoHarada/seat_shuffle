import { create } from "zustand";

interface CanvasSelectionStore {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  selectOnly: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
}

export const useCanvasSelectionStore = create<CanvasSelectionStore>((set) => ({
  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  selectOnly: (id) => set({ selectedIds: [id] }),
  toggleSelection: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((entry) => entry !== id)
        : [...state.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),
}));
