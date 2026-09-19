import type { AppSettings, AppState } from "../types/app";
import type { CanvasObject } from "../types/canvas";
import type { Constraint } from "../types/constraint";
import type { GenderType, Role, Student } from "../types/student";
import type { Group } from "../types/group";
import type { Seat } from "../types/seat";

export const PROJECT_BACKUP_VERSION = 1 as const;

export type ProjectSnapshot = {
  version: typeof PROJECT_BACKUP_VERSION;
  students: Student[];
  roles: Role[];
  groups: Group[];
  seats: Seat[];
  objects: CanvasObject[];
  constraints: Constraint[];
  appSettings: AppSettings;
};

export type BackupParseResult =
  | { ok: true; snapshot: ProjectSnapshot }
  | { ok: false; reason: "corrupt" };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isGender(value: unknown): value is GenderType {
  return value === "male" || value === "female" || value === "other";
}

function isAppSettings(value: unknown): value is AppSettings {
  if (!isObject(value)) return false;
  const algorithm = value.algorithm;
  const shuffleAnimation = value.shuffleAnimation;
  const autoAssignAlgorithm = value.autoAssignAlgorithm;
  const algorithmOk = algorithm === "random" || algorithm === "optimize";
  const animationOk =
    shuffleAnimation === "none" ||
    shuffleAnimation === "confetti" ||
    shuffleAnimation === "slide" ||
    shuffleAnimation === "flash";
  const assignOk =
    autoAssignAlgorithm === "right-top-down" ||
    autoAssignAlgorithm === "left-top-down" ||
    autoAssignAlgorithm === "left-top-right" ||
    autoAssignAlgorithm === "random";
  return algorithmOk && animationOk && assignOk;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStudent(value: unknown): value is Student {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isGender(value.gender) &&
    typeof value.attendanceNumber === "number" &&
    isStringArray(value.roleIds)
  );
}

function isRole(value: unknown): value is Role {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.iconName === "string"
  );
}

function isGroup(value: unknown): value is Group {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.color === "string"
  );
}

function isSeat(value: unknown): value is Seat {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.studentId === null || typeof value.studentId === "string") &&
    isStringArray(value.groupIds) &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.isLocked === "boolean"
  );
}

function isCanvasObject(value: unknown): value is CanvasObject {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.type === "rectangle" || value.type === "circle") &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.width === "number" &&
    typeof value.height === "number"
  );
}

function isConstraint(value: unknown): value is Constraint {
  if (!isObject(value)) return false;
  if (typeof value.id !== "string" || typeof value.isEnabled !== "boolean") {
    return false;
  }
  if (value.type === "student-student") {
    return (
      typeof value.studentId1 === "string" &&
      typeof value.studentId2 === "string" &&
      (value.matchType === "close" || value.matchType === "far")
    );
  }
  if (value.type === "student-group") {
    return (
      typeof value.studentId === "string" &&
      isStringArray(value.groupIds) &&
      (value.matchType === "include" || value.matchType === "exclude")
    );
  }
  if (value.type === "group-match") {
    return (
      (value.targetType === "role" || value.targetType === "gender") &&
      typeof value.targetId === "string" &&
      isStringArray(value.groupIds) &&
      typeof value.minCount === "number"
    );
  }
  return false;
}

function readArray<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
): T[] | null {
  if (!Array.isArray(value) || !value.every(guard)) return null;
  return value;
}

export function serializeProjectBackup(state: AppState): string {
  const snapshot: ProjectSnapshot = {
    version: PROJECT_BACKUP_VERSION,
    students: state.students,
    roles: state.roles,
    groups: state.groups,
    seats: state.seats,
    objects: state.objects,
    constraints: state.constraints,
    appSettings: state.appSettings,
  };
  return JSON.stringify(snapshot);
}

export function parseProjectBackup(text: string): BackupParseResult {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!isObject(parsed)) return { ok: false, reason: "corrupt" };
    if (parsed.version !== PROJECT_BACKUP_VERSION) {
      return { ok: false, reason: "corrupt" };
    }
    const students = readArray(parsed.students, isStudent);
    const roles = readArray(parsed.roles, isRole);
    const groups = readArray(parsed.groups, isGroup);
    const seats = readArray(parsed.seats, isSeat);
    const objects = readArray(parsed.objects, isCanvasObject);
    const constraints = readArray(parsed.constraints, isConstraint);
    if (
      !students ||
      !roles ||
      !groups ||
      !seats ||
      !objects ||
      !constraints ||
      !isAppSettings(parsed.appSettings)
    ) {
      return { ok: false, reason: "corrupt" };
    }
    return {
      ok: true,
      snapshot: {
        version: PROJECT_BACKUP_VERSION,
        students,
        roles,
        groups,
        seats,
        objects,
        constraints,
        appSettings: parsed.appSettings,
      },
    };
  } catch {
    return { ok: false, reason: "corrupt" };
  }
}

export type ProjectBackupPatch = Omit<ProjectSnapshot, "version">;

export function applyProjectBackup(
  snapshot: ProjectSnapshot,
): ProjectBackupPatch {
  return {
    students: snapshot.students,
    roles: snapshot.roles,
    groups: snapshot.groups,
    seats: snapshot.seats,
    objects: snapshot.objects,
    constraints: snapshot.constraints,
    appSettings: snapshot.appSettings,
  };
}
