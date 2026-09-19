import { create } from "zustand";
import type { Seat } from "../types/seat";
import type { CanvasObject } from "../types/canvas";

export interface ClipboardData {
  seats: Seat[];
  objects: CanvasObject[];
}

interface ClipboardStore {
  clipboard: ClipboardData | null;
  setClipboard: (data: ClipboardData) => void;
  clearClipboard: () => void;
}

export const useClipboardStore = create<ClipboardStore>((set) => ({
  clipboard: null,
  setClipboard: (clipboard) => set({ clipboard }),
  clearClipboard: () => set({ clipboard: null }),
}));
