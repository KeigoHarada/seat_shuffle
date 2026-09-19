import type { Student, Role } from "../types/student";
import type { Group } from "../types/group";
import type { Seat } from "../types/seat";
import type { CanvasObject } from "../types/canvas";
import type { Constraint } from "../types/constraint";
import { generateTemplate } from "../services/templates";
import { assignGroupsByBlocks } from "../services/group";
import type { UndoSnapshot } from "../types/history";
import { PREDEFINED_COLORS } from "../constants/groupPalette";

export const DEFAULT_ROLES: Role[] = [
  {
    id: "role-leader",
    name: "班長",
    iconName: "Crown",
    description: "班のリーダー",
  },
  {
    id: "role-subleader",
    name: "副班長",
    iconName: "Star",
    description: "班のサブリーダー",
  },
];

export const DEFAULT_GROUPS: Group[] = [
  {
    id: "group-1",
    name: "1班",
    color: PREDEFINED_COLORS[0],
    description: "第1グループ",
  },
  {
    id: "group-2",
    name: "2班",
    color: PREDEFINED_COLORS[1],
    description: "第2グループ",
  },
  {
    id: "group-3",
    name: "3班",
    color: PREDEFINED_COLORS[2],
    description: "第3グループ",
  },
  {
    id: "group-4",
    name: "4班",
    color: PREDEFINED_COLORS[3],
    description: "第4グループ",
  },
  {
    id: "group-5",
    name: "5班",
    color: PREDEFINED_COLORS[4],
    description: "第5グループ",
  },
  {
    id: "group-6",
    name: "6班",
    color: PREDEFINED_COLORS[5],
    description: "第6グループ",
  },
  {
    id: "group-vision",
    name: "前方配慮（視力等）",
    color: PREDEFINED_COLORS[6],
    description: "黒板が見えやすい前方の座席を希望する生徒向けグループ",
  },
];

export const RAW_STUDENTS = [
  {
    name: "く太郎",
    furigana: "クタロウ",
    gender: "male" as const,
    roleIds: [],
  },
  {
    name: "い太郎",
    furigana: "イタロウ",
    gender: "male" as const,
    roleIds: [],
  },
  {
    name: "せ花子",
    furigana: "セハナコ",
    gender: "female" as const,
    roleIds: [],
  },
  {
    name: "お太郎",
    furigana: "オタロウ",
    gender: "male" as const,
    roleIds: [],
  },
  {
    name: "こ花子",
    furigana: "コハナコ",
    gender: "female" as const,
    roleIds: [],
  },
  {
    name: "あ太郎",
    furigana: "アタロウ",
    gender: "male" as const,
    roleIds: ["role-leader"],
  },
  {
    name: "か花子",
    furigana: "カハナコ",
    gender: "female" as const,
    roleIds: ["role-subleader"],
  },
  {
    name: "す太郎",
    furigana: "スタロウ",
    gender: "male" as const,
    roleIds: [],
  },
  {
    name: "う花子",
    furigana: "ウハナコ",
    gender: "female" as const,
    roleIds: ["role-leader"],
  },
  {
    name: "け太郎",
    furigana: "ケタロウ",
    gender: "male" as const,
    roleIds: ["role-subleader"],
  },
  {
    name: "こ太郎",
    furigana: "コタロウ",
    gender: "male" as const,
    roleIds: [],
  },
  {
    name: "い花子",
    furigana: "イハナコ",
    gender: "female" as const,
    roleIds: [],
  },
  {
    name: "さ花子",
    furigana: "サハナコ",
    gender: "female" as const,
    roleIds: ["role-subleader"],
  },
  {
    name: "か太郎",
    furigana: "カタロウ",
    gender: "male" as const,
    roleIds: ["role-leader"],
  },
  {
    name: "け花子",
    furigana: "ケハナコ",
    gender: "female" as const,
    roleIds: [],
  },
  {
    name: "え太郎",
    furigana: "エタロウ",
    gender: "male" as const,
    roleIds: ["role-subleader"],
  },
  {
    name: "し花子",
    furigana: "シハナコ",
    gender: "female" as const,
    roleIds: [],
  },
  {
    name: "き太郎",
    furigana: "キタロウ",
    gender: "male" as const,
    roleIds: [],
  },
  {
    name: "あ花子",
    furigana: "アハナコ",
    gender: "female" as const,
    roleIds: ["role-subleader"],
  },
  {
    name: "そ太郎",
    furigana: "ソタロウ",
    gender: "male" as const,
    roleIds: [],
  },
  {
    name: "く花子",
    furigana: "クハナコ",
    gender: "female" as const,
    roleIds: ["role-leader"],
  },
  {
    name: "う太郎",
    furigana: "ウタロウ",
    gender: "male" as const,
    roleIds: [],
  },
  {
    name: "す花子",
    furigana: "スハナコ",
    gender: "female" as const,
    roleIds: ["role-leader"],
  },
  {
    name: "お花子",
    furigana: "オハナコ",
    gender: "female" as const,
    roleIds: [],
  },
  {
    name: "さ太郎",
    furigana: "サタロウ",
    gender: "male" as const,
    roleIds: ["role-leader"],
  },
  {
    name: "え花子",
    furigana: "エハナコ",
    gender: "female" as const,
    roleIds: [],
  },
  {
    name: "せ太郎",
    furigana: "セタロウ",
    gender: "male" as const,
    roleIds: ["role-subleader"],
  },
  {
    name: "き花子",
    furigana: "キハナコ",
    gender: "female" as const,
    roleIds: [],
  },
  {
    name: "し太郎",
    furigana: "シタロウ",
    gender: "male" as const,
    roleIds: [],
  },
  {
    name: "そ花子",
    furigana: "ソハナコ",
    gender: "female" as const,
    roleIds: [],
  },
];

export const createSampleStudents = (): Student[] => {
  return RAW_STUDENTS.map((s, index) => ({
    id: `student-${index + 1}`,
    name: s.name,
    furigana: s.furigana,
    gender: s.gender,
    attendanceNumber: index + 1,
    roleIds: [...s.roleIds],
  }));
};

export const createDefaultClassroomState = () => {
  const { seats: rawSeats, objects } = generateTemplate("classroom", 0, 0);

  const roles: Role[] = DEFAULT_ROLES.map((r) => ({ ...r }));
  const groups: Group[] = DEFAULT_GROUPS.map((g) => ({ ...g }));

  const classGroups = groups.filter((g) => g.id !== "group-vision");
  const seatsWithClassGroups = assignGroupsByBlocks(
    rawSeats,
    classGroups,
    3,
    2,
    "right-to-left",
  );

  const seatsWithAllGroups = seatsWithClassGroups.map((seat) => ({
    ...seat,
    groupIds:
      seat.y === 0 ? [...seat.groupIds, "group-vision"] : [...seat.groupIds],
  }));

  const students: Student[] = createSampleStudents();

  const sortedSeatsForPlacement = [...seatsWithAllGroups].sort((a, b) => {
    if (Math.abs(b.x - a.x) > 0.1) return b.x - a.x;
    return a.y - b.y;
  });

  const seatToStudentMap = new Map<string, string>();
  sortedSeatsForPlacement.forEach((seat, idx) => {
    if (students[idx]) {
      seatToStudentMap.set(seat.id, students[idx].id);
    }
  });

  const seats: Seat[] = seatsWithAllGroups.map((seat) => ({
    ...seat,
    studentId: seatToStudentMap.get(seat.id) || null,
  }));

  const constraints: Constraint[] = [
    {
      id: "constraint-default-1",
      type: "student-student",
      studentId1: "student-6",
      studentId2: "student-19",
      matchType: "far",
      isEnabled: true,
    },
    {
      id: "constraint-default-2",
      type: "group-match",
      targetType: "gender",
      targetId: "male",
      minCount: 2,
      groupIds: classGroups.map((g) => g.id),
      isEnabled: true,
    },
    {
      id: "constraint-default-3",
      type: "group-match",
      targetType: "gender",
      targetId: "female",
      minCount: 2,
      groupIds: classGroups.map((g) => g.id),
      isEnabled: true,
    },
    {
      id: "constraint-default-4",
      type: "group-match",
      targetType: "role",
      targetId: "role-leader",
      minCount: 1,
      groupIds: classGroups.map((g) => g.id),
      isEnabled: true,
    },
    {
      id: "constraint-default-5",
      type: "student-group",
      studentId: "student-28",
      groupIds: ["group-vision"],
      matchType: "include",
      isEnabled: true,
    },
  ];

  return {
    students,
    roles,
    groups,
    seats,
    objects,
    constraints,
    undoStack: [] as UndoSnapshot[],
  };
};

export const createTourInitialState = () => {
  const seats: Seat[] = [];
  const objects: CanvasObject[] = [];

  const roles: Role[] = DEFAULT_ROLES.map((r) => ({ ...r }));
  const groups: Group[] = DEFAULT_GROUPS.map((g) => ({ ...g }));

  const allStudents = createSampleStudents();
  const students: Student[] = allStudents.slice(0, 29);

  const classGroups = groups.filter((g) => g.id !== "group-vision");
  const constraints: Constraint[] = [
    {
      id: "constraint-default-1",
      type: "student-student",
      studentId1: "student-6",
      studentId2: "student-19",
      matchType: "far",
      isEnabled: true,
    },
    {
      id: "constraint-default-2",
      type: "group-match",
      targetType: "gender",
      targetId: "male",
      minCount: 2,
      groupIds: classGroups.map((g) => g.id),
      isEnabled: true,
    },
    {
      id: "constraint-default-3",
      type: "group-match",
      targetType: "gender",
      targetId: "female",
      minCount: 2,
      groupIds: classGroups.map((g) => g.id),
      isEnabled: true,
    },
  ];

  return {
    students,
    roles,
    groups,
    seats,
    objects,
    constraints,
    undoStack: [] as UndoSnapshot[],
  };
};

export const createEmptyState = () => ({
  students: [] as Student[],
  roles: [] as Role[],
  groups: [] as Group[],
  seats: [] as Seat[],
  objects: [] as CanvasObject[],
  constraints: [] as Constraint[],
  undoStack: [] as UndoSnapshot[],
});
