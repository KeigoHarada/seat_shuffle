import type { GenderType } from "../types";

export const GENDERS = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
} as const satisfies Record<string, GenderType>;

export type { GenderType };

export const PREDEFINED_COLORS = [
  "#FCA5A5",
  "#93C5FD",
  "#86EFAC",
  "#FDE047",
  "#D8B4FE",
  "#FDBA74",
  "#5EEAD4",
  "#F472B6",
  "#A78BFA",
  "#CBD5E1",
] as const;

export const GENDER_OPTIONS = [
  { label: "その他", value: GENDERS.OTHER },
  { label: "男", value: GENDERS.MALE },
  { label: "女", value: GENDERS.FEMALE },
];
