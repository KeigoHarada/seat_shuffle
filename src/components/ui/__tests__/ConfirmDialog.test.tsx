import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ConfirmDialog from "../ConfirmDialog";

describe("ConfirmDialog portal", () => {
  let container: HTMLDivElement;
  let header: HTMLElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    header = document.createElement("header");
    header.className = "app-header";
    header.style.position = "relative";
    header.style.zIndex = "10";
    header.appendChild(container);
    document.body.appendChild(header);
  });

  afterEach(async () => {
    const currentRoot = root;
    if (currentRoot) {
      await act(async () => {
        currentRoot.unmount();
      });
      root = null;
    }
    if (header.parentNode) {
      document.body.removeChild(header);
    }
  });

  it("mounts the overlay on document.body instead of the header host", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <ConfirmDialog
          isOpen
          title="インポート"
          message="バックアップファイルを読み込むと、いまの教室を置き換えます。壊れたファイルは読み込みません。"
          confirmText="読み込む"
          cancelText="キャンセル"
          variant="primary"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );
    });

    const overlay = document.querySelector(".modal-overlay");
    expect(overlay).not.toBeNull();
    expect(overlay?.parentElement).toBe(document.body);
    expect(header.contains(overlay)).toBe(false);
    expect(overlay?.textContent).toContain("インポート");
    expect(overlay?.textContent).toContain("バックアップファイル");
  });
});
