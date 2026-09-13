/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import GlobalTab from "../global/GlobalTab";
import { useStore } from "../../../stores";

describe("GlobalTab その他（OFUSE支援）Section", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    useStore.setState({
      appSettings: {
        gridRows: 6,
        gridCols: 6,
        soundEnabled: true,
        theme: "light",
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

  it("renders その他 section with OFUSE support card in GlobalTab", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    expect(container.textContent).toContain("その他");
    expect(container.textContent).toContain("開発者を応援・寄付（OFUSE）");
    expect(container.textContent).toContain("OFUSEで応援メッセージを送る");
    expect(container.textContent).toContain("URLコピー");

    const ofuseLink = container.querySelector(
      "#btn-ofuse-donate",
    ) as HTMLAnchorElement;
    expect(ofuseLink).not.toBeNull();
    expect(ofuseLink.href).toBe("https://ofuse.me/o?uid=218335");
    expect(ofuseLink.getAttribute("data-ofuse-id")).toBe("218335");
    expect(ofuseLink.getAttribute("data-ofuse-size")).toBe("large");
    expect(ofuseLink.getAttribute("data-ofuse-color")).toBe("dark-invert");
    expect(ofuseLink.target).toBe("_blank");
  });

  it("copies OFUSE URL when clicking URLコピー button", async () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    const copyBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("URLコピー"),
    );
    expect(copyBtn).toBeDefined();

    await act(async () => {
      copyBtn?.click();
    });

    expect(writeTextMock).toHaveBeenCalledWith("https://ofuse.me/o?uid=218335");

    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it("loads OFUSE widget script on mount", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    const script = document.getElementById("ofuse-widget-script") as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.src).toContain("https://ofuse.me/assets/platform/widget.js");
  });
});
