import { describe, it, expect } from "vitest";
import { exportSettingsToCSV, importSettingsFromCSV } from "../csv";
import { AppState } from "../../types";
import fs from "fs";
import path from "path";

describe("csv", () => {
  const mockStatePath = path.resolve(
    __dirname,
    "../__fixtures__/csv-test-fixture.json",
  );
  const csvDataPath = path.resolve(
    __dirname,
    "../__fixtures__/csv-test-fixture.csv",
  );

  const mockState = JSON.parse(
    fs.readFileSync(mockStatePath, "utf-8"),
  ) as AppState;
  const csvData = fs.readFileSync(csvDataPath, "utf-8");

  it("should export state to CSV format", () => {
    const csv = exportSettingsToCSV(mockState);

    expect(csv).toContain("# Students");
    expect(csv).toContain("1,山田 太郎,ヤマダ タロウ,male,班長");
    expect(csv).toContain("2,鈴木 花子,スズキ ハナコ,female,副班長");
    expect(csv).toContain("# Roles");
    expect(csv).toContain("班長,Crown,班のリーダー");
    expect(csv).toContain("副班長,Star,班のサブリーダー");
    expect(csv).toContain("# Groups");
    expect(csv).toContain("1班,#FCA5A5,第一グループ");
    expect(csv).toContain("# Constraints");
    expect(csv).toContain("student-student,true");
  });

  it("should import state from CSV format", () => {
    const importedState = importSettingsFromCSV(csvData);

    expect(importedState.students).toHaveLength(2);
    expect(importedState.students![0].name).toBe("山田 太郎");
    expect(importedState.students![0].gender).toBe("male");
    expect(importedState.students![0].roleIds).toHaveLength(1);

    expect(importedState.students![1].name).toBe("鈴木 花子");
    expect(importedState.students![1].gender).toBe("female");
    expect(importedState.students![1].roleIds).toHaveLength(1);

    expect(importedState.roles).toHaveLength(2);
    expect(importedState.roles![0].name).toBe("班長");
    expect(importedState.roles![1].name).toBe("副班長");

    expect(importedState.groups).toHaveLength(1);
    expect(importedState.groups![0].name).toBe("1班");

    expect(importedState.constraints).toHaveLength(1);
    expect(importedState.constraints![0].type).toBe("student-student");
    expect(importedState.constraints![0].isEnabled).toBe(true);
  });
});
