import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "../../../stores";
import DesktopApp from "../DesktopApp";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

describe("DesktopApp compact chrome", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStore.setState({
      isViewMode: false,
      isSettingsOpen: true,
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

  it("keeps footer shuffle and closes settings on compact mount", async () => {
    mockMatchMedia(true);
    window.innerWidth = 375;

    await act(async () => {
      root?.render(<DesktopApp />);
    });

    const shell = container.querySelector(".app-shell");
    expect(shell?.getAttribute("data-compact")).toBe("true");
    expect(container.querySelector("#btn-footer-shuffle")).not.toBeNull();
    const printButton = container.querySelector("#btn-footer-print");
    expect(printButton?.getAttribute("aria-label")).toBe("印刷");
    expect(printButton?.querySelector(".app-chrome-label")?.textContent).toBe(
      "印刷",
    );
    expect(container.querySelector(".app-footer")?.contains(printButton)).toBe(
      true,
    );
    const header = container.querySelector(".app-header");
    expect(header?.textContent).toContain("はじめてガイド");
    expect(header?.textContent).toContain("名簿を取り込む");
    expect(header?.textContent).toContain("バックアップ");
    expect(header?.textContent).not.toContain("インポート");
    expect(header?.textContent).not.toContain("エクスポート");
    expect(
      container
        .querySelector(".app-footer-cluster-center")
        ?.contains(container.querySelector("#btn-footer-shuffle")),
    ).toBe(true);
    expect(container.querySelector("#btn-header-settings")).not.toBeNull();
    expect(container.querySelector(".phone-tabbar")).toBeNull();
    expect(
      container.querySelector(".app-settings")?.getAttribute("data-open"),
    ).toBe("false");
  });

  it("keeps the sidebar available on wide chrome", async () => {
    mockMatchMedia(false);
    window.innerWidth = 1280;

    await act(async () => {
      root?.render(<DesktopApp />);
    });

    expect(
      container.querySelector(".app-shell")?.getAttribute("data-compact"),
    ).toBe("false");
    expect(
      container.querySelector(".app-settings")?.getAttribute("data-open"),
    ).toBe("true");
    expect(container.querySelector(".app-settings-scrim")).toBeNull();
  });
});
