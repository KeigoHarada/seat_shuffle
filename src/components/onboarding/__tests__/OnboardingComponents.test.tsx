/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import WelcomeModal from "../WelcomeModal";
import GuideHubModal from "../GuideHubModal";
import ResetConfirmModal from "../ResetConfirmModal";
import TourCompletionModal from "../TourCompletionModal";
import TourOverlay from "../TourOverlay";
import { useOnboardingStore } from "../../../stores/onboarding";

describe("Onboarding Components", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useOnboardingStore.setState({
      hasCompletedOnboarding: false,
      isTourActive: false,
      currentTourStep: 0,
      isWelcomeModalOpen: false,
      isGuideHubOpen: false,
      selectedGuideTab: "tour",
      isResetConfirmOpen: false,
      isCompletionModalOpen: false,
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

  it("renders WelcomeModal when isWelcomeModalOpen is true", async () => {
    await act(async () => {
      useOnboardingStore.setState({ isWelcomeModalOpen: true });
      if (root) root.render(<WelcomeModal />);
    });

    expect(container.textContent).toContain("ラクガエへようこそ！");
    expect(container.textContent).toContain("3分ガイドを始める");
  });

  it("renders GuideHubModal and changes tabs", async () => {
    await act(async () => {
      useOnboardingStore.setState({
        isGuideHubOpen: true,
        selectedGuideTab: "move_seats",
      });
      if (root) root.render(<GuideHubModal />);
    });

    expect(container.textContent).toContain("ラクガエ はじめてガイド");
    expect(container.textContent).toContain("座席をまとめて移動させたい");
  });

  it("renders ResetConfirmModal when open", async () => {
    await act(async () => {
      useOnboardingStore.setState({ isResetConfirmOpen: true });
      if (root) root.render(<ResetConfirmModal />);
    });

    expect(container.textContent).toContain("ガイドの開始方法を選択");
    expect(container.textContent).toContain("ガイド用のデータで開始");
  });

  it("renders TourCompletionModal when open", async () => {
    await act(async () => {
      useOnboardingStore.setState({ isCompletionModalOpen: true });
      if (root) root.render(<TourCompletionModal />);
    });

    expect(container.textContent).toContain("ツアー完了！準備完了です");
    expect(container.textContent).toContain("さっそく使ってみる");
  });

  it("renders TourOverlay with step details when tour is active", async () => {
    await act(async () => {
      useOnboardingStore.setState({ isTourActive: true, currentTourStep: 0 });
      if (root) root.render(<TourOverlay />);
    });

    expect(container.textContent).toContain("ステップ");
    expect(container.textContent).toContain("1. 座席を配置する場所（Canvas）");
    expect(container.textContent).toContain("次へ");
  });
});
