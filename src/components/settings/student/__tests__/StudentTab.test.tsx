import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import StudentTab from "../StudentTab";
import { ROSTER_IMPORT_CONFIRM } from "../../../../hooks/useProjectIo";

describe("StudentTab roster IO", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    const currentRoot = root;
    if (currentRoot) {
      await act(async () => {
        currentRoot.unmount();
      });
      root = null;
    }
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  it("exposes roster and backup actions with the locked confirm copy", async () => {
    await act(async () => {
      root?.render(<StudentTab />);
    });
    expect(container.textContent).toContain("名簿を取り込む");
    expect(container.textContent).toContain("バックアップを保存");
    expect(container.textContent).toContain("バックアップを読み込む");
    expect(container.textContent).not.toContain("JSON");
    expect(ROSTER_IMPORT_CONFIRM).toBe(
      "名簿だけ取り込みます。席の割り当てと条件はクリアされます（座席の配置・グループ設定はそのまま）。",
    );
  });
});
