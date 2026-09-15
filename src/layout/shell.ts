export const COMPACT_MAX_WIDTH_PX = 1023;

export function isCompactWidth(width: number): boolean {
  return width <= COMPACT_MAX_WIDTH_PX;
}

export function compactMediaQuery(): string {
  return `(max-width: ${COMPACT_MAX_WIDTH_PX}px)`;
}
