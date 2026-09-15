/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { PHONE_MAX_WIDTH_PX, shellKindFromWidth } from "../shell";

describe("shellKindFromWidth", () => {
  it("treats iPhone widths as phone", () => {
    expect(shellKindFromWidth(375)).toBe("phone");
    expect(shellKindFromWidth(PHONE_MAX_WIDTH_PX)).toBe("phone");
  });

  it("treats iPad portrait and laptops as desktop", () => {
    expect(shellKindFromWidth(768)).toBe("desktop");
    expect(shellKindFromWidth(1280)).toBe("desktop");
  });
});
