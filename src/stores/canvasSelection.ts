import { create } from "zustand";

interface CanvasSelectionStore {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}

export const useCanvasSelectionStore = create<CanvasSelectionStore>((set) => ({
  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),
}));
