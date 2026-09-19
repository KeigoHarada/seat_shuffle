import { create } from "zustand";
import type { CanvasTool, SettingsTab, UiState, UiStore } from "../types/ui";

export const initialUiState: UiState = {
  canvasTool: "select",
  isViewMode: false,
  isSettingsOpen: true,
  activeSettingsTab: "students",
  highlightedStudentId: null,
  editingStudentId: null,
  isShuffling: false,
};

export const useUiStore = create<UiStore>()((set) => ({
  ...initialUiState,

  setCanvasTool: (canvasTool: CanvasTool) => set({ canvasTool }),
  setIsViewMode: (isViewMode: boolean) => set({ isViewMode }),
  setIsSettingsOpen: (isSettingsOpen: boolean) => set({ isSettingsOpen }),
  setActiveSettingsTab: (activeSettingsTab: SettingsTab) =>
    set({ activeSettingsTab }),
  setHighlightedStudentId: (highlightedStudentId: string | null) =>
    set({ highlightedStudentId }),
  setEditingStudentId: (editingStudentId: string | null) =>
    set({ editingStudentId }),
  setIsShuffling: (isShuffling: boolean) => set({ isShuffling }),
  resetUiState: () => set(initialUiState),
}));
