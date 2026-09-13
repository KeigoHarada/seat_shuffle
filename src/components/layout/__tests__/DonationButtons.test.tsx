/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Header from "../Header";
import Footer from "../Footer";
import { useStore } from "../../../stores";

describe("Main screen (Header and Footer) without donation buttons", () => {
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

  it("ensures Header does not render donation buttons on the main screen", async () => {
    await act(async () => {
      if (root) {
        root.render(
          <Header showSettings={false} onToggleSettings={() => {}} />,
        );
      }
    });

    const donationBtn = container.querySelector("#header-donation-btn");
    expect(donationBtn).toBeNull();
    expect(container.textContent).not.toContain("寄付で応援");
  });

  it("ensures Footer does not render donation buttons on the main screen", async () => {
    await act(async () => {
      if (root) {
        root.render(<Footer />);
      }
    });

    const donationBtn = container.querySelector("#footer-donation-btn");
    expect(donationBtn).toBeNull();
    expect(container.textContent).not.toContain("開発者を応援・寄付する");
  });
});
