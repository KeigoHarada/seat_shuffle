/**
 * @vitest-environment jsdom
 */
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

  it("renders support card at the bottom of GlobalTab", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    expect(container.textContent).toContain("開発者を応援・寄付する");
    expect(container.textContent).toContain("応援メッセージ・寄付を送る");

    // Must not contain "その他" wrapper or explicit "OFUSE" label or emojis
    expect(container.textContent).not.toContain("その他");
    expect(container.textContent).not.toContain("OFUSE");
    expect(container.textContent).not.toContain("URLコピー");
    expect(container.textContent).not.toContain("💌");

    const supportLink = container.querySelector(
      "#btn-support-donate",
    ) as HTMLAnchorElement;
    expect(supportLink).not.toBeNull();
    expect(supportLink.href).toBe("https://ofuse.me/o?uid=218335");
    expect(supportLink.getAttribute("data-ofuse-id")).toBe("218335");
    expect(supportLink.getAttribute("data-ofuse-size")).toBe("large");
    expect(supportLink.getAttribute("data-ofuse-color")).toBe("dark-invert");
    expect(supportLink.target).toBe("_blank");

    // Parent container should be centered
    const buttonParent = supportLink.parentElement;
    expect(buttonParent?.style.justifyContent).toBe("center");
  });

  it("loads widget script on mount", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    const script = document.getElementById(
      "ofuse-widget-script",
    ) as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.src).toContain("https://ofuse.me/assets/platform/widget.js");
  });
});
