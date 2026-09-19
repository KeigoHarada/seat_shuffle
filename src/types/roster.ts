import type { GenderType, Student, Role } from "./student";
import type { Seat } from "./seat";
import type { Constraint } from "./constraint";

export type ParsedRosterRow = {
  name: string;
  attendanceNumber: number;
  furigana?: string;
  gender: GenderType;
  roleNames: string[];
};

export type RosterParseOk = {
  ok: true;
  rows: ParsedRosterRow[];
  skipped: number;
};

export type RosterParseErr = {
  ok: false;
  reason: "missing-name-column" | "zero-valid-rows";
};

export type RosterParseResult = RosterParseOk | RosterParseErr;

export type RosterImportPatch = {
  students: Student[];
  roles: Role[];
  seats: Seat[];
  constraints: Constraint[];
};
