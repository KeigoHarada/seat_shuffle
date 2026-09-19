import { create } from "zustand";
import type { PrintMode } from "../utils/printLayout";

interface PrintSessionStore {
  mode: PrintMode;
  setMode: (mode: PrintMode) => void;
}

export const usePrintSessionStore = create<PrintSessionStore>((set) => ({
  mode: "wall",
  setMode: (mode) => set({ mode }),
}));
