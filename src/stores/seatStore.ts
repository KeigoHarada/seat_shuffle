import { create } from "zustand";
import type { SeatLayout, Student, Group, Role, Condition } from "../types";
import type { AppState } from "../types";
import type { ConditionValidationResult } from "../utils/condition/validate";
import type { ShuffleManager } from "../utils/ShuffleManager";
import {
  DEFAULT_GROUPS,
  DEFAULT_ROLES,
  DEFAULT_CONDITIONS,
} from "./initialState";
import { createStudentSlice } from "./slices/studentSlice";
import { createLayoutSlice } from "./slices/layoutSlice";
import { createGroupSlice } from "./slices/groupSlice";
import { createRoleSlice } from "./slices/roleSlice";
import { createConditionSlice } from "./slices/conditionSlice";
import { createSeatInteractionSlice } from "./slices/seatInteractionSlice";
import { createShuffleSlice } from "./slices/shuffleSlice";
import { createSettingsSlice, loadBgmEnabled } from "./slices/settingsSlice";

export interface SeatStore extends AppState {
  shuffleManager: ShuffleManager;
  setCurrentLayout: (layout: SeatLayout) => void;
  addStudent: (student: Student) => void;
  removeStudent: (studentId: string) => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  assignStudentToSeat: (studentId: string, seatId: string) => void;
  removeStudentFromSeat: (seatId: string) => void;
  createLayout: (rows: number, cols: number, name: string) => void;
  toggleSeatEmpty: (seatId: string) => void;
  shuffleSeats: () => Promise<void>;
  toggleSettings: () => void;
  addGroup: (group: Group) => void;
  removeGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  toggleGroupOnSeat: (seatId: string, groupId: string) => void;
  addRole: (role: Role) => void;
  removeRole: (roleId: string) => void;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  assignRoleToStudent: (studentId: string, roleId: string) => void;
  removeRoleFromStudent: (studentId: string, roleId: string) => void;
  addCondition: (condition: Condition) => void;
  removeCondition: (conditionId: string) => void;
  updateCondition: (conditionId: string, updates: Partial<Condition>) => void;
  toggleCondition: (conditionId: string) => void;
  selectedSeatId: string | null;
  setSelectedSeatId: (seatId: string | null) => void;
  swapSeats: (seatId1: string, seatId2: string) => void;
  assignStudentNameToSeat: (
    seatId: string,
    studentName: string,
    furigana?: string,
  ) => void;
  initializeDefaultLayout: () => void;
  settingsPanelWidth: number;
  setSettingsPanelWidth: (width: number) => void;
  validateConditions: () => ConditionValidationResult;
  checkConditionConflicts: () => ConditionValidationResult;
  setShuffleAnimation: (animationName: string) => void;
  getShuffleAnimation: () => import("../utils/shuffleAnimations").ShuffleAnimation;
  bgmEnabled: boolean;
  setBgmEnabled: (enabled: boolean) => void;
}

export const useSeatStore = create<SeatStore>((set, get) => ({
  currentLayout: null,
  students: [],
  groups: DEFAULT_GROUPS,
  roles: DEFAULT_ROLES,
  conditions: DEFAULT_CONDITIONS,
  isShuffling: false,
  showSettings: false,
  selectedSeatId: null,
  settingsPanelWidth: 600,
  bgmEnabled: loadBgmEnabled(),

  ...createStudentSlice(set as (p: unknown) => void),
  ...createLayoutSlice(set as (p: unknown) => void, get as () => SeatStore),
  ...createGroupSlice(set as (p: unknown) => void),
  ...createRoleSlice(set as (p: unknown) => void),
  ...createConditionSlice(set as (p: unknown) => void, get as () => SeatStore),
  ...createSeatInteractionSlice(
    set as (p: unknown) => void,
    get as () => SeatStore,
  ),
  ...createShuffleSlice(set as (p: unknown) => void, get as () => SeatStore),
  ...createSettingsSlice(set as (p: unknown) => void),
}));
