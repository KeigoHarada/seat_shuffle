/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import DonationModal from "../DonationModal";
import {
  useDonationStore,
  DEFAULT_DONATION_SETTINGS,
} from "../../../stores/donation";

describe("DonationModal", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    useDonationStore.setState({
      isDonationModalOpen: false,
      activeTab: "plans",
      selectedTierAmount: 1000,
      customAmount: "1000",
      donationSettings: { ...DEFAULT_DONATION_SETTINGS },
      donationRecords: [],
      isCelebrating: false,
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

  it("does not render when isDonationModalOpen is false", async () => {
    await act(async () => {
      if (root) root.render(<DonationModal />);
    });
    expect(container.textContent).toBe("");
  });

  it("renders when isDonationModalOpen is true with plans tab by default", async () => {
    await act(async () => {
      useDonationStore.setState({ isDonationModalOpen: true });
      if (root) root.render(<DonationModal />);
    });

    expect(container.textContent).toContain("ラクガエの開発を応援・寄付する");
    expect(container.textContent).toContain("OFUSE (オフセ)");
    expect(container.textContent).toContain("Buy Me a Coffee");
    expect(container.textContent).toContain("GitHub Sponsors");
    expect(container.textContent).toContain("コーヒー1杯コース");
  });

  it("switches tabs when clicking tab buttons", async () => {
    await act(async () => {
      useDonationStore.setState({ isDonationModalOpen: true });
      if (root) root.render(<DonationModal />);
    });

    const messageTabBtn = container.querySelector(
      "#donation-tab-message",
    ) as HTMLButtonElement;
    expect(messageTabBtn).not.toBeNull();

    await act(async () => {
      messageTabBtn.click();
    });

    expect(container.textContent).toContain("お名前 / ニックネーム");
    expect(container.textContent).toContain("応援メッセージ");

    const settingsTabBtn = container.querySelector(
      "#donation-tab-settings",
    ) as HTMLButtonElement;
    await act(async () => {
      settingsTabBtn.click();
    });

    expect(container.textContent).toContain("寄付先URLのカスタマイズ");
    expect(container.textContent).toContain("OFUSE (オフセ) URL");
  });

  it("submits in-app support message, records donation, and shows thank you screen", async () => {
    await act(async () => {
      useDonationStore.setState({
        isDonationModalOpen: true,
        activeTab: "message",
      });
      if (root) root.render(<DonationModal />);
    });

    const nameInput = container.querySelector(
      'input[placeholder*="〇〇小学校"]',
    ) as HTMLInputElement;
    const messageInput = container.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;
    const submitBtn = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(nameInput).not.toBeNull();
    expect(messageInput).not.toBeNull();

    const setNativeValue = (
      element: HTMLInputElement | HTMLTextAreaElement,
      value: string,
    ) => {
      const prototype = Object.getPrototypeOf(element);
      const valueSetter = Object.getOwnPropertyDescriptor(
        prototype,
        "value",
      )?.set;
      valueSetter?.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    };

    await act(async () => {
      setNativeValue(nameInput, "鈴木先生");
      setNativeValue(messageInput, "本当に助かっています！");
    });

    await act(async () => {
      submitBtn.click();
    });

    expect(container.textContent).toContain("温かい応援・ご寄付をありがとうございます！");
    expect(container.textContent).toContain("公認ラクガエサポーターに認定されました！");

    const state = useDonationStore.getState();
    expect(state.donationRecords.length).toBe(1);
    expect(state.donationRecords[0].name).toBe("鈴木先生");
    expect(state.donationRecords[0].message).toBe("本当に助かっています！");
    expect(state.hasDonated()).toBe(true);
  });

  it("closes modal on Escape key press", async () => {
    await act(async () => {
      useDonationStore.setState({ isDonationModalOpen: true });
      if (root) root.render(<DonationModal />);
    });

    expect(useDonationStore.getState().isDonationModalOpen).toBe(true);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(useDonationStore.getState().isDonationModalOpen).toBe(false);
  });

  it("closes modal when clicking close button", async () => {
    await act(async () => {
      useDonationStore.setState({ isDonationModalOpen: true });
      if (root) root.render(<DonationModal />);
    });

    const closeBtn = container.querySelector(
      ".modal-close-btn",
    ) as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();

    await act(async () => {
      closeBtn.click();
    });

    expect(useDonationStore.getState().isDonationModalOpen).toBe(false);
  });

  it("copies platform URL when clicking copy button", async () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    await act(async () => {
      useDonationStore.setState({ isDonationModalOpen: true, activeTab: "plans" });
      if (root) root.render(<DonationModal />);
    });

    const copyButtons = container.querySelectorAll("button");
    const ofuseCopyBtn = Array.from(copyButtons).find((b) =>
      b.textContent?.includes("コピー"),
    );
    expect(ofuseCopyBtn).toBeDefined();

    await act(async () => {
      ofuseCopyBtn?.click();
    });

    expect(writeTextMock).toHaveBeenCalledWith(
      DEFAULT_DONATION_SETTINGS.ofuseUrl,
    );

    Object.assign(navigator, { clipboard: originalClipboard });
  });
});
