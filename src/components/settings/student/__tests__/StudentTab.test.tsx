import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import StudentTab from "../StudentTab";
import { useStore } from "../../../../stores";

describe("StudentTab roster editing", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStore.getState().loadDefaultTemplate();
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

  it("keeps add/edit only and has no backup or roster file controls", async () => {
    await act(async () => {
      root?.render(<StudentTab />);
    });
    expect(container.querySelector("#student-add-form")).not.toBeNull();
    expect(container.textContent).not.toContain("名簿を取り込む");
    expect(container.textContent).not.toContain("バックアップ");
    expect(container.textContent).not.toContain("インポート");
    expect(container.textContent).not.toContain("エクスポート");
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });
});
