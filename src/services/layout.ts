import { COMPACT_MAX_WIDTH_PX } from "../constants/layout";

export { COMPACT_MAX_WIDTH_PX };

export function isCompactWidth(width: number): boolean {
  return width <= COMPACT_MAX_WIDTH_PX;
}

export function compactMediaQuery(): string {
  return `(max-width: ${COMPACT_MAX_WIDTH_PX}px)`;
}
