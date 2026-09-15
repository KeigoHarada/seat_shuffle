/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import PhoneApp from "../PhoneApp";
import { useStore } from "../../../stores";

describe("PhoneApp C1 destinations", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStore.setState({
      isViewMode: false,
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

  it("starts on seats with a phone shuffle action and no desktop chrome", async () => {
    await act(async () => {
      root?.render(<PhoneApp />);
    });

    const shell = container.querySelector('[data-kind="phone"]');
    expect(shell).not.toBeNull();
    expect(
      container
        .querySelector("[data-phone-destination]")
        ?.getAttribute("data-phone-destination"),
    ).toBe("seats");
    expect(container.querySelector("#btn-phone-shuffle")).not.toBeNull();
    expect(container.querySelector("#btn-phone-viewmode")).not.toBeNull();
    expect(container.querySelector("#btn-footer-shuffle")).toBeNull();
    expect(container.querySelector("#btn-header-settings")).toBeNull();
    expect(container.querySelector("#tab-btn-students")).toBeNull();
  });

  it("moves roster and constraints to full screens instead of a sidebar", async () => {
    await act(async () => {
      root?.render(<PhoneApp />);
    });

    await act(async () => {
      container.querySelector<HTMLButtonElement>("#tab-phone-roster")?.click();
    });
    expect(
      container
        .querySelector("[data-phone-destination]")
        ?.getAttribute("data-phone-destination"),
    ).toBe("roster");
    expect(container.querySelector("#btn-phone-shuffle")).toBeNull();
    expect(container.querySelector("#btn-phone-viewmode")).toBeNull();
    expect(container.textContent).toContain("生徒");

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>("#tab-phone-constraints")
        ?.click();
    });
    expect(
      container
        .querySelector("[data-phone-destination]")
        ?.getAttribute("data-phone-destination"),
    ).toBe("constraints");
    expect(container.textContent).toContain("条件");
    expect(container.textContent).not.toContain("生徒設定");
  });

  it("keeps shuffle on the seats screen in view mode", async () => {
    useStore.setState({ isViewMode: true });
    await act(async () => {
      root?.render(<PhoneApp />);
    });

    expect(container.querySelector("#btn-phone-shuffle")).not.toBeNull();
  });
});
