import { describe, it, expect } from "vitest";
import { COMPACT_MAX_WIDTH_PX, isCompactWidth } from "../shell";

describe("isCompactWidth", () => {
  it("treats phones and portrait tablets as compact", () => {
    expect(isCompactWidth(375)).toBe(true);
    expect(isCompactWidth(768)).toBe(true);
    expect(isCompactWidth(820)).toBe(true);
    expect(isCompactWidth(COMPACT_MAX_WIDTH_PX)).toBe(true);
  });

  it("treats 1024px and laptops as the full sidebar layout", () => {
    expect(isCompactWidth(1024)).toBe(false);
    expect(isCompactWidth(1280)).toBe(false);
  });
});
