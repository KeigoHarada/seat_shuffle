import type {
  Group,
  Role,
  RoleGroupCondition,
  StudentDistanceCondition,
} from "../types";

export const DEFAULT_GROUPS: Group[] = [
  { id: "group-han-1", name: "班1", color: "#3B82F6" },
  { id: "group-han-2", name: "班2", color: "#10B981" },
  { id: "group-han-3", name: "班3", color: "#F59E0B" },
  { id: "group-han-4", name: "班4", color: "#EF4444" },
  { id: "group-han-5", name: "班5", color: "#8B5CF6" },
  { id: "group-han-6", name: "班6", color: "#EC4899" },
];

export const DEFAULT_ROLES: Role[] = [
  {
    id: "role-class-leader",
    name: "学級委員",
    icon: "crown",
    description: "クラスの代表として活動する",
  },
  {
    id: "role-vice-leader",
    name: "副学級委員",
    icon: "shield",
    description: "学級委員をサポートする",
  },
];

export const DEFAULT_CONDITIONS: (
  | RoleGroupCondition
  | StudentDistanceCondition
)[] = [
  {
    id: "condition-han-1-leaders",
    name: "班1に学級委員を配置",
    type: "role-group",
    enabled: true,
    description: "班1に学級委員を1人配置する",
    roleId: "role-class-leader",
    groupIds: ["group-han-1"],
    count: 1,
  },
  {
    id: "condition-gender-balance",
    name: "班1・班2に男女バランス",
    type: "role-group",
    enabled: true,
    description: "班1・班2に男女をバランスよく配置する",
    gender: "male",
    groupIds: ["group-han-1", "group-han-2"],
    count: 2,
  },
  {
    id: "condition-separate-troublemakers",
    name: "問題児を離す",
    type: "student-distance",
    enabled: false,
    description: "特定の生徒同士を離して配置する",
    studentId1: "student-1",
    studentId2: "student-2",
    shouldBeClose: false,
  },
];
