/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import GlobalTab from "../global/GlobalTab";
import { useStore } from "../../../stores";
import { useDonationStore } from "../../../stores/donation";

describe("GlobalTab Donation Section", () => {
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

    useDonationStore.setState({
      isDonationModalOpen: false,
      activeTab: "plans",
      donationRecords: [],
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

  it("renders donation section in GlobalTab and opens donation modal", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    expect(container.textContent).toContain("開発者を支援・寄付");
    expect(container.textContent).toContain("寄付・応援する");
    expect(container.textContent).toContain("寄付先URL設定");

    const donateBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("寄付・応援する"),
    );
    expect(donateBtn).toBeDefined();

    await act(async () => {
      donateBtn?.click();
    });

    const donationState = useDonationStore.getState();
    expect(donationState.isDonationModalOpen).toBe(true);
    expect(donationState.activeTab).toBe("plans");
  });

  it("opens settings tab in donation modal from GlobalTab", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    const settingsBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("寄付先URL設定"),
    );
    expect(settingsBtn).toBeDefined();

    await act(async () => {
      settingsBtn?.click();
    });

    const donationState = useDonationStore.getState();
    expect(donationState.isDonationModalOpen).toBe(true);
    expect(donationState.activeTab).toBe("settings");
  });

  it("displays supporter badge when donation records exist", async () => {
    useDonationStore.setState({
      donationRecords: [
        {
          id: "d1",
          timestamp: new Date().toISOString(),
          amount: 3000,
          name: "田中先生",
          message: "応援してます！",
          method: "OFUSE",
        },
      ],
    });

    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    expect(container.textContent).toContain("サポーター ✨");
    expect(container.textContent).toContain("¥3,000");
  });
});
