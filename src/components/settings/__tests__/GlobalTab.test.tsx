import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import GlobalTab from "../global/GlobalTab";
import { useStore } from "../../../stores";

describe("GlobalTab Support Section", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    useStore.setState({
      appSettings: {
        algorithm: "random",
        shuffleAnimation: "none",
        autoAssignAlgorithm: "right-top-down",
      },
    });
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

  it("renders support card at the bottom of GlobalTab", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    expect(container.textContent).toContain("開発者を応援・寄付する");
    expect(container.textContent).toContain("応援メッセージ・寄付を送る");
    expect(container.textContent).toContain("バックアップ・引き継ぎ");
    expect(container.textContent).toContain("バックアップを保存");
    expect(container.textContent).toContain("バックアップを読み込む");
    expect(container.textContent).not.toContain("JSON");
    expect(container.textContent).not.toContain("json");

    expect(container.textContent).not.toContain("その他");
    expect(container.textContent).not.toContain("OFUSE");
    expect(container.textContent).not.toContain("URLコピー");
    expect(container.textContent).not.toContain("💌");

    const supportLink = container.querySelector(
      "#btn-support-donate",
    ) as HTMLAnchorElement;
    expect(supportLink).not.toBeNull();
    expect(supportLink.href).toBe("https://ofuse.me/o?uid=218335");
    expect(supportLink.className).toBe("btn-primary");
    expect(supportLink.target).toBe("_blank");
    expect(supportLink.getAttribute("data-ofuse-widget-button")).toBeNull();
    expect(supportLink.getAttribute("data-ofuse-id")).toBeNull();
    expect(supportLink.getAttribute("data-ofuse-size")).toBeNull();
    expect(supportLink.getAttribute("data-ofuse-color")).toBeNull();
    expect(supportLink.getAttribute("data-ofuse-text")).toBeNull();

    const buttonParent = supportLink.parentElement;
    expect(buttonParent?.style.justifyContent).toBe("center");
  });

  it("keeps test playback running until settings change", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    const playButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("テスト実行"),
    );
    expect(playButton).toBeTruthy();

    await act(async () => {
      playButton?.click();
    });
    expect(container.textContent).toContain("テスト再生中...");

    await act(async () => {
      useStore.setState((state) => ({
        appSettings: { ...state.appSettings, algorithm: "optimize" },
      }));
    });
    expect(container.textContent).toContain("テスト実行");
    expect(container.textContent).not.toContain("テスト再生中...");
  });

  it("does not load the Ofuse widget script", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    expect(document.getElementById("ofuse-widget-script")).toBeNull();
    expect(
      document.querySelector('script[src*="ofuse.me/assets/platform/widget.js"]'),
    ).toBeNull();
  });
});
