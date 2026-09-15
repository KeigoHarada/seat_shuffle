import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return [full];
  });
}

function sourceOf(dir: string): string {
  return walk(dir)
    .filter((file) => /\.(tsx|ts|css)$/.test(file))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}

describe("desktop and phone view isolation", () => {
  it("keeps desktop chrome out of the phone tree", () => {
    const phone = sourceOf(join(SRC, "views/phone"));
    expect(phone).not.toMatch(/views\/desktop/);
    expect(phone).not.toMatch(/DesktopHeader|DesktopFooter|DesktopApp/);
    expect(phone).not.toMatch(/SettingsPanel/);
  });

  it("keeps phone chrome out of the desktop tree", () => {
    const desktop = sourceOf(join(SRC, "views/desktop"));
    expect(desktop).not.toMatch(/views\/phone/);
    expect(desktop).not.toMatch(/PhoneHeader|PhoneFooter|PhoneApp|phone\.css/);
  });

  it("does not share layout chrome through compact or layout props", () => {
    const views = sourceOf(join(SRC, "views"));
    expect(views).not.toMatch(/layout=["']phone["']/);
    expect(views).not.toMatch(/compact\s*[={]/);
  });
});
