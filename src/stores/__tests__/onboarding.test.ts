import { describe, it, expect, beforeEach } from "vitest";
import { useOnboardingStore } from "../onboarding";
import { TOUR_STEPS } from "../../components/onboarding/tourSteps";
import { useStore } from "../appStore";

describe("useOnboardingStore", () => {
  beforeEach(() => {
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

  it("should open and close welcome modal", () => {
    useOnboardingStore.getState().openWelcomeModal();

    expect(useOnboardingStore.getState().isWelcomeModalOpen).toBe(true);

    useOnboardingStore.getState().closeWelcomeModal();

    expect(useOnboardingStore.getState().isWelcomeModalOpen).toBe(false);
  });

  it("should open, change tab, and close guide hub", () => {
    useOnboardingStore.getState().openGuideHub("move_seats");

    expect(useOnboardingStore.getState().isGuideHubOpen).toBe(true);
    expect(useOnboardingStore.getState().selectedGuideTab).toBe("move_seats");

    useOnboardingStore.getState().setSelectedGuideTab("constraints");

    expect(useOnboardingStore.getState().selectedGuideTab).toBe("constraints");

    useOnboardingStore.getState().closeGuideHub();

    expect(useOnboardingStore.getState().isGuideHubOpen).toBe(false);
  });

  it("should navigate through tour steps sequentially and complete tour", () => {
    const totalSteps = TOUR_STEPS.length;
    useOnboardingStore.getState().startTour(0);

    expect(useOnboardingStore.getState().isTourActive).toBe(true);
    expect(useOnboardingStore.getState().currentTourStep).toBe(0);

    useOnboardingStore.getState().nextTourStep();
    expect(useOnboardingStore.getState().currentTourStep).toBe(1);

    useOnboardingStore.getState().prevTourStep();
    expect(useOnboardingStore.getState().currentTourStep).toBe(0);

    for (let i = 0; i < totalSteps - 1; i++) {
      useOnboardingStore.getState().nextTourStep();
    }
    expect(useOnboardingStore.getState().currentTourStep).toBe(totalSteps - 1);

    useOnboardingStore.getState().nextTourStep();
    expect(useOnboardingStore.getState().isTourActive).toBe(false);
    expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(true);
    expect(useOnboardingStore.getState().isCompletionModalOpen).toBe(true);
  });

  it("should handle start tour request with confirmation when data exists", () => {
    useStore.getState().loadDefaultTemplate();
    expect(useStore.getState().students.length).toBeGreaterThan(0);

    useOnboardingStore.getState().handleStartTourRequest();

    expect(useOnboardingStore.getState().isResetConfirmOpen).toBe(true);

    useOnboardingStore.getState().confirmStartTourWithDefaultData();

    expect(useOnboardingStore.getState().isResetConfirmOpen).toBe(false);
    expect(useOnboardingStore.getState().isTourActive).toBe(true);
    expect(useOnboardingStore.getState().currentTourStep).toBe(0);
  });

  it("should initialize 9 tour steps with correct 29-student state on tour start", () => {
    useStore.getState().clearState();

    useStore.getState().loadTourInitialState();

    expect(TOUR_STEPS.length).toBe(9);
    expect(useStore.getState().students.length).toBe(29);
    expect(useStore.getState().seats.length).toBe(0);
    expect(useStore.getState().groups.length).toBe(7);
  });
});
