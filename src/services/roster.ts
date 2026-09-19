import type { AppState } from "../types/app";
import type { GenderType, Role, Student } from "../types/student";
import { GENDERS } from "../constants/gender";

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

const ROSTER_HEADERS = {
  name: "名前",
  attendanceNumber: "出席番号",
  furigana: "ふりがな",
  gender: "性別",
  role: "ロール",
} as const;

function splitCsvLine(line: string): string[] {
  return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
}

function cleanCol(raw: string | undefined): string {
  return (raw || "").replace(/^"|"$/g, "").replace(/""/g, '"').trim();
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function parseGender(raw: string): GenderType {
  switch (raw) {
    case "男":
    case "男性":
    case GENDERS.MALE:
      return GENDERS.MALE;
    case "女":
    case "女性":
    case GENDERS.FEMALE:
      return GENDERS.FEMALE;
    default:
      return GENDERS.OTHER;
  }
}

function parseAttendance(raw: string, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

export function parseRosterCsv(text: string): RosterParseResult {
  const lines = stripBom(text)
    .split(/\r?\n/)
    .map((l) => l.trim());
  const headerLine = lines.find((l) => l.length > 0);
  if (!headerLine) {
    return { ok: false, reason: "missing-name-column" };
  }

  const headerIndex = lines.indexOf(headerLine);
  const headers = splitCsvLine(headerLine).map(cleanCol);
  const nameIndex = headers.indexOf(ROSTER_HEADERS.name);
  if (nameIndex < 0) {
    return { ok: false, reason: "missing-name-column" };
  }

  const attendanceIndex = headers.indexOf(ROSTER_HEADERS.attendanceNumber);
  const furiganaIndex = headers.indexOf(ROSTER_HEADERS.furigana);
  const genderIndex = headers.indexOf(ROSTER_HEADERS.gender);
  const roleIndex = headers.indexOf(ROSTER_HEADERS.role);

  const rows: ParsedRosterRow[] = [];
  let skipped = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cols = splitCsvLine(line);
    const name = cleanCol(cols[nameIndex]);
    if (!name) {
      skipped += 1;
      continue;
    }
    const roleRaw = roleIndex >= 0 ? cleanCol(cols[roleIndex]) : "";
    const furigana =
      furiganaIndex >= 0 ? cleanCol(cols[furiganaIndex]) : "";
    const row: ParsedRosterRow = {
      name,
      attendanceNumber: parseAttendance(
        attendanceIndex >= 0 ? cleanCol(cols[attendanceIndex]) : "",
        rows.length + 1,
      ),
      gender: parseGender(genderIndex >= 0 ? cleanCol(cols[genderIndex]) : ""),
      roleNames: roleRaw
        ? roleRaw
            .split("|")
            .map((r) => r.trim())
            .filter(Boolean)
        : [],
    };
    if (furigana) row.furigana = furigana;
    rows.push(row);
  }

  if (rows.length === 0) {
    return { ok: false, reason: "zero-valid-rows" };
  }

  return { ok: true, rows, skipped };
}

export type RosterImportPatch = Pick<
  AppState,
  "students" | "roles" | "seats" | "constraints"
>;

export function applyRosterImport(
  state: AppState,
  parsed: RosterParseOk,
): RosterImportPatch {
  const roles = [...state.roles];
  const roleNameToId = new Map(roles.map((r) => [r.name, r.id]));

  const ensureRole = (name: string): string => {
    const existing = roleNameToId.get(name);
    if (existing) return existing;
    const role: Role = {
      id: crypto.randomUUID(),
      name,
      iconName: "User",
    };
    roles.push(role);
    roleNameToId.set(name, role.id);
    return role.id;
  };

  const students: Student[] = parsed.rows.map((row) => ({
    id: crypto.randomUUID(),
    name: row.name,
    furigana: row.furigana,
    gender: row.gender,
    attendanceNumber: row.attendanceNumber,
    roleIds: row.roleNames.map(ensureRole),
  }));

  return {
    students,
    roles,
    seats: state.seats.map((seat) => ({
      ...seat,
      studentId: null,
      isLocked: false,
    })),
    constraints: [],
  };
}
