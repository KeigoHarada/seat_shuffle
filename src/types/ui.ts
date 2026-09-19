export type CanvasTool = "select" | "hand";

export type SettingsTab =
  | "students"
  | "roles"
  | "groups"
  | "constraints"
  | "global";

export interface UiState {
  canvasTool: CanvasTool;
  isViewMode: boolean;
  isSettingsOpen: boolean;
  activeSettingsTab: SettingsTab;
  highlightedStudentId: string | null;
  editingStudentId: string | null;
  isShuffling: boolean;
}

export interface UiActions {
  setCanvasTool: (tool: CanvasTool) => void;
  setIsViewMode: (isViewMode: boolean) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setActiveSettingsTab: (tab: SettingsTab) => void;
  setHighlightedStudentId: (id: string | null) => void;
  setEditingStudentId: (id: string | null) => void;
  setIsShuffling: (isShuffling: boolean) => void;
  resetUiState: () => void;
}

export type UiStore = UiState & UiActions;
