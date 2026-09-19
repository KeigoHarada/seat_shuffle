import type { Student, Role } from "./student";
import type { Group } from "./group";
import type { Seat } from "./seat";
import type { CanvasObject } from "./canvas";
import type { Constraint } from "./constraint";
import type { ShuffleAnimationType } from "./animation";

export interface AppSettings {
  algorithm: "random" | "optimize";
  shuffleAnimation: ShuffleAnimationType;
  autoAssignAlgorithm:
    "right-top-down" | "left-top-down" | "left-top-right" | "random";
}

export interface AppState {
  students: Student[];
  roles: Role[];
  groups: Group[];
  seats: Seat[];
  objects: CanvasObject[];
  constraints: Constraint[];
  appSettings: AppSettings;
}
