export const GENDERS = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
} as const;

export type GenderType = (typeof GENDERS)[keyof typeof GENDERS];

export const GENDER_OPTIONS = [
  { label: "その他", value: GENDERS.OTHER },
  { label: "男", value: GENDERS.MALE },
  { label: "女", value: GENDERS.FEMALE },
];
