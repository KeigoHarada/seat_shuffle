import { create } from "zustand";
import type { PrintMode, PrintOrientation } from "../types/print";

interface PrintSessionStore {
  mode: PrintMode;
  orientation: PrintOrientation;
  setMode: (mode: PrintMode) => void;
  setOrientation: (orientation: PrintOrientation) => void;
}

export const usePrintSessionStore = create<PrintSessionStore>((set) => ({
  mode: "wall",
  orientation: "landscape",
  setMode: (mode) => set({ mode }),
  setOrientation: (orientation) => set({ orientation }),
}));
