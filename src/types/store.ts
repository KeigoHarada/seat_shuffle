import type { AppState, AppSettings } from "./app";
import type { Student, Role } from "./student";
import type { Group } from "./group";
import type { Seat } from "./seat";
import type { CanvasObject } from "./canvas";
import type { Constraint } from "./constraint";
import type { RosterParseOk } from "./roster";
import type { ProjectSnapshot } from "./backup";
import type { UndoSnapshot } from "./history";

export interface StateAndActions extends AppState {
  clearState: () => void;
  loadDefaultTemplate: () => void;
  loadTourInitialState: () => void;
  loadState: (state: Partial<AppState>) => void;
  importRoster: (parsed: RosterParseOk) => void;
  replaceProject: (snapshot: ProjectSnapshot) => void;
  isViewMode: boolean;
  setIsViewMode: (val: boolean) => void;

  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  removeStudent: (id: string) => void;
  reorderStudents: (startIndex: number, endIndex: number) => void;
  sortStudentsByName: () => void;

  addRole: (role: Role) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  removeRole: (id: string) => void;

  addGroup: (group: Group) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  removeGroup: (id: string) => void;

  addSeat: (seat: Seat) => void;
  updateSeat: (id: string, updates: Partial<Seat>) => void;
  removeSeat: (id: string) => void;
  setSeats: (seats: Seat[]) => void;
  undoStack: UndoSnapshot[];
  pushUndo: () => void;
  undo: () => void;

  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;

  addConstraint: (constraint: Constraint) => void;
  updateConstraint: (id: string, updates: Partial<Constraint>) => void;
  removeConstraint: (id: string) => void;

  updateAppSettings: (updates: Partial<AppSettings>) => void;
  canvasTool: "select" | "hand";
  setCanvasTool: (tool: "select" | "hand") => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  activeSettingsTab: "students" | "roles" | "groups" | "constraints" | "global";
  setActiveSettingsTab: (
    tab: "students" | "roles" | "groups" | "constraints" | "global",
  ) => void;
  highlightedStudentId: string | null;
  setHighlightedStudentId: (id: string | null) => void;
  editingStudentId: string | null;
  setEditingStudentId: (id: string | null) => void;
  isShuffling: boolean;
  setIsShuffling: (isShuffling: boolean) => void;
}
