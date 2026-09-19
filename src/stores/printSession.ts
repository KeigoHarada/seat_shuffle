import { create } from "zustand";
import type { PrintMode } from "../utils/printLayout";

interface PrintSessionStore {
  dialogOpen: boolean;
  draftMode: PrintMode;
  confirmedMode: PrintMode | null;
  frozenIds: string[] | null;
  openDialog: (selectedIds: string[]) => void;
  closeDialog: () => void;
  setDraftMode: (mode: PrintMode) => void;
  confirmMode: () => void;
}

export const usePrintSessionStore = create<PrintSessionStore>((set) => ({
  dialogOpen: false,
  draftMode: "wall",
  confirmedMode: null,
  frozenIds: null,
  openDialog: (selectedIds) =>
    set((state) => ({
      dialogOpen: true,
      draftMode: state.confirmedMode ?? "wall",
      frozenIds: selectedIds,
    })),
  closeDialog: () => set({ dialogOpen: false, frozenIds: null }),
  setDraftMode: (mode) => set({ draftMode: mode }),
  confirmMode: () =>
    set((state) => ({
      confirmedMode: state.draftMode,
    })),
}));
