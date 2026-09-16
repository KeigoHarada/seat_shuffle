import React, { useEffect } from "react";
import { useOnboardingStore } from "../../stores/onboarding";
import WelcomeModal from "./WelcomeModal";
import GuideHubModal from "./GuideHubModal";
import TourOverlay from "./TourOverlay";
import ResetConfirmModal from "./ResetConfirmModal";
import TourCompletionModal from "./TourCompletionModal";

export const OnboardingController: React.FC = () => {
  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding,
  );
  const isTourActive = useOnboardingStore((state) => state.isTourActive);
  const isWelcomeModalOpen = useOnboardingStore(
    (state) => state.isWelcomeModalOpen,
  );
  const openWelcomeModal = useOnboardingStore(
    (state) => state.openWelcomeModal,
  );

  useEffect(() => {
    if (!hasCompletedOnboarding && !isTourActive && !isWelcomeModalOpen) {
      const timer = setTimeout(() => {
        openWelcomeModal();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    hasCompletedOnboarding,
    isTourActive,
    isWelcomeModalOpen,
    openWelcomeModal,
  ]);

  return (
    <>
      <WelcomeModal />
      <GuideHubModal />
      <TourOverlay />
      <ResetConfirmModal />
      <TourCompletionModal />
    </>
  );
};

export default OnboardingController;
