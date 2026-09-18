export const COMPACT_MAX_WIDTH_PX = 1023;

export const PRINT_SHEET_PX = { width: 960, height: 640 } as const;
export const PRINT_FIT_PADDING_PX = 16;

export function isCompactWidth(width: number): boolean {
  return width <= COMPACT_MAX_WIDTH_PX;
}

export function compactMediaQuery(): string {
  return `(max-width: ${COMPACT_MAX_WIDTH_PX}px)`;
}
