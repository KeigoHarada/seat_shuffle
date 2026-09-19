import type { AppSettings } from "./app";
import type { CanvasObject } from "./canvas";
import type { Constraint } from "./constraint";
import type { Group } from "./group";
import type { Role, Student } from "./student";
import type { Seat } from "./seat";

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
