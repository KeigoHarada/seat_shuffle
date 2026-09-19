import { create } from "zustand";
import { flushSync } from "react-dom";
import type { PrintMode, PrintOrientation } from "../types/print";
import { useStore } from "./appStore";
import { useCanvasSelectionStore } from "./canvasSelection";
import { showToast } from "./toast";
import { createPrintPlan } from "../services/printLayout";

interface PrintSessionStore {
  mode: PrintMode;
  orientation: PrintOrientation;
  isDialogOpen: boolean;
  draftMode: PrintMode;
  draftOrientation: PrintOrientation;
  dialogSelectedIds: readonly string[];

  setMode: (mode: PrintMode) => void;
  setOrientation: (orientation: PrintOrientation) => void;
  setDraftMode: (mode: PrintMode) => void;
  setDraftOrientation: (orientation: PrintOrientation) => void;
  openPrintDialog: () => void;
  closePrintDialog: () => void;
  confirmPrint: () => void;
}

export const usePrintSessionStore = create<PrintSessionStore>((set, get) => ({
  mode: "wall",
  orientation: "landscape",
  isDialogOpen: false,
  draftMode: "wall",
  draftOrientation: "landscape",
  dialogSelectedIds: [],

  setMode: (mode) => set({ mode }),
  setOrientation: (orientation) => set({ orientation }),
  setDraftMode: (draftMode) => set({ draftMode }),
  setDraftOrientation: (draftOrientation) => set({ draftOrientation }),

  openPrintDialog: () => {
    const { students, seats, objects } = useStore.getState();
    const selectedIds = useCanvasSelectionStore.getState().selectedIds;
    const { mode, orientation } = get();

    const plan = createPrintPlan(
      { students, seats, objects },
      mode,
      selectedIds,
      orientation,
    );

    if (plan.kind === "empty") {
      showToast.info("印刷できる座席や図形がありません");
      return;
    }

    set({
      draftMode: mode,
      draftOrientation: orientation,
      dialogSelectedIds: selectedIds,
      isDialogOpen: true,
    });
  },

  closePrintDialog: () => {
    set({ isDialogOpen: false });
  },

  confirmPrint: () => {
    const { draftMode, draftOrientation } = get();
    flushSync(() => {
      set({
        mode: draftMode,
        orientation: draftOrientation,
      });
    });
    window.print();
    set({ isDialogOpen: false });
  },
}));
