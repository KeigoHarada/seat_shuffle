import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(process.cwd(), "src");

describe("responsive shell", () => {
  it("does not ship a separate phone destination tree", () => {
    expect(existsSync(join(SRC, "views/phone"))).toBe(false);
    const app = readFileSync(join(SRC, "App.tsx"), "utf8");
    expect(app).not.toMatch(/PhoneApp/);
    expect(app).not.toMatch(/useShellKind/);
    expect(app).not.toMatch(/DonationModal/);
  });

  it("does not ship the unused in-app donation module", () => {
    expect(existsSync(join(SRC, "components/donation"))).toBe(false);
    expect(existsSync(join(SRC, "stores/donation.ts"))).toBe(false);
  });
});
