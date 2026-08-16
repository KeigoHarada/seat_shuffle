import { describe, it, expect, beforeEach } from "vitest";
import { useOnboardingStore } from "../onboarding";
import { TOUR_STEPS } from "../../constants/tourSteps";
import { useStore } from "../index";

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
    // Arrange & Act
    useOnboardingStore.getState().openWelcomeModal();

    // Assert
    expect(useOnboardingStore.getState().isWelcomeModalOpen).toBe(true);

    // Act
    useOnboardingStore.getState().closeWelcomeModal();

    // Assert
    expect(useOnboardingStore.getState().isWelcomeModalOpen).toBe(false);
  });

  it("should open, change tab, and close guide hub", () => {
    // Arrange & Act
    useOnboardingStore.getState().openGuideHub("seats");

    // Assert
    expect(useOnboardingStore.getState().isGuideHubOpen).toBe(true);
    expect(useOnboardingStore.getState().selectedGuideTab).toBe("seats");

    // Act
    useOnboardingStore.getState().setSelectedGuideTab("constraints");

    // Assert
    expect(useOnboardingStore.getState().selectedGuideTab).toBe("constraints");

    // Act
    useOnboardingStore.getState().closeGuideHub();

    // Assert
    expect(useOnboardingStore.getState().isGuideHubOpen).toBe(false);
  });

  it("should navigate through tour steps sequentially and complete tour", () => {
    // Arrange
    const totalSteps = TOUR_STEPS.length;
    useOnboardingStore.getState().startTour(0);

    // Assert step 0
    expect(useOnboardingStore.getState().isTourActive).toBe(true);
    expect(useOnboardingStore.getState().currentTourStep).toBe(0);

    // Act - step forward
    useOnboardingStore.getState().nextTourStep();
    expect(useOnboardingStore.getState().currentTourStep).toBe(1);

    // Act - step backward
    useOnboardingStore.getState().prevTourStep();
    expect(useOnboardingStore.getState().currentTourStep).toBe(0);

    // Step to last step
    for (let i = 0; i < totalSteps - 1; i++) {
      useOnboardingStore.getState().nextTourStep();
    }
    expect(useOnboardingStore.getState().currentTourStep).toBe(totalSteps - 1);

    // Final step forward should finish tour and open completion modal
    useOnboardingStore.getState().nextTourStep();
    expect(useOnboardingStore.getState().isTourActive).toBe(false);
    expect(useOnboardingStore.getState().hasCompletedOnboarding).toBe(true);
    expect(useOnboardingStore.getState().isCompletionModalOpen).toBe(true);
  });

  it("should handle start tour request with confirmation when data exists", () => {
    // Arrange
    useStore.getState().loadDefaultTemplate();
    expect(useStore.getState().students.length).toBeGreaterThan(0);

    // Act
    useOnboardingStore.getState().handleStartTourRequest();

    // Assert - Reset confirmation opened
    expect(useOnboardingStore.getState().isResetConfirmOpen).toBe(true);

    // Act - Confirm with default data
    useOnboardingStore.getState().confirmStartTourWithDefaultData();

    // Assert
    expect(useOnboardingStore.getState().isResetConfirmOpen).toBe(false);
    expect(useOnboardingStore.getState().isTourActive).toBe(true);
    expect(useOnboardingStore.getState().currentTourStep).toBe(0);
  });

  it("should initialize 9 tour steps with correct 29-student state on tour start", () => {
    // Arrange
    useStore.getState().clearState();

    // Act
    useStore.getState().loadTourInitialState();

    // Assert
    expect(TOUR_STEPS.length).toBe(9);
    expect(useStore.getState().students.length).toBe(29);
    expect(useStore.getState().seats.length).toBe(0);
    expect(useStore.getState().groups.length).toBe(7); // 1-6班 + 前方配慮
  });
});
