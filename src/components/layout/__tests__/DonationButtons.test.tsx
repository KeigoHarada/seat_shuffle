/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Header from "../Header";
import Footer from "../Footer";
import { useStore } from "../../../stores";
import { useDonationStore } from "../../../stores/donation";

describe("Donation Buttons in Header and Footer", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    useStore.setState({
      isViewMode: false,
    });

    useDonationStore.setState({
      isDonationModalOpen: false,
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

  it("renders donation button in Header and opens modal on click", async () => {
    await act(async () => {
      if (root) {
        root.render(
          <Header showSettings={false} onToggleSettings={() => {}} />,
        );
      }
    });

    const donationBtn = container.querySelector(
      "#header-donation-btn",
    ) as HTMLButtonElement;
    expect(donationBtn).not.toBeNull();
    expect(donationBtn.textContent).toContain("寄付で応援");

    await act(async () => {
      donationBtn.click();
    });

    expect(useDonationStore.getState().isDonationModalOpen).toBe(true);
  });

  it("renders donation button in Footer and opens modal on click", async () => {
    await act(async () => {
      if (root) {
        root.render(<Footer />);
      }
    });

    const donationBtn = container.querySelector(
      "#footer-donation-btn",
    ) as HTMLButtonElement;
    expect(donationBtn).not.toBeNull();
    expect(donationBtn.textContent).toContain("開発者を応援・寄付する");

    await act(async () => {
      donationBtn.click();
    });

    expect(useDonationStore.getState().isDonationModalOpen).toBe(true);
  });

  it("shows supporter badge in Header and Footer when donation exists", async () => {
    useDonationStore.setState({
      donationRecords: [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          amount: 1000,
          name: "先生",
          message: "応援！",
          method: "OFUSE",
        },
      ],
    });

    await act(async () => {
      if (root) {
        root.render(
          <div>
            <Header showSettings={false} onToggleSettings={() => {}} />
            <Footer />
          </div>,
        );
      }
    });

    const headerBtn = container.querySelector("#header-donation-btn");
    expect(headerBtn?.textContent).toContain("応援・寄付 ✨");

    const footerBtn = container.querySelector("#footer-donation-btn");
    expect(footerBtn?.textContent).toContain("サポーター ✨");
  });
});
