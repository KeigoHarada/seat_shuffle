export const PHONE_MAX_WIDTH_PX = 767;

export type ShellKind = "phone" | "desktop";

export type PhoneDestination = "seats" | "roster" | "constraints";

export type RosterPage = "students" | "roles" | "groups";

export const PHONE_TABS: readonly {
  id: PhoneDestination;
  label: string;
}[] = [
  { id: "seats", label: "座席" },
  { id: "roster", label: "名簿" },
  { id: "constraints", label: "条件" },
] as const;

export function shellKindFromWidth(width: number): ShellKind {
  return width <= PHONE_MAX_WIDTH_PX ? "phone" : "desktop";
}

export function phoneMediaQuery(): string {
  return `(max-width: ${PHONE_MAX_WIDTH_PX}px)`;
}

export function assertUnhandledShell(kind: never): never {
  throw new Error(`Unhandled shell kind: ${String(kind)}`);
}

export function assertUnhandledDestination(destination: never): never {
  throw new Error(`Unhandled phone destination: ${String(destination)}`);
}

export function assertUnhandledRosterPage(page: never): never {
  throw new Error(`Unhandled roster page: ${String(page)}`);
}
