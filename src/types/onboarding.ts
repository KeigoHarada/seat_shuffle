import type React from "react";
import type { StateAndActions } from "./store";

export interface GuideItem {
  id: string;
  label: string;
  title: string;
  description: string;
  points: string[];
  hint?: React.ReactNode;
  shortcuts?: { key: string; desc: string }[];
  videos?: {
    url: string;
    title: string;
    description?: string;
    steps?: string[];
  }[];
}

export interface GuideCategory {
  id: string;
  label: string;
  iconNode?: React.ReactNode;
  items: GuideItem[];
}

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  isTourActive: boolean;
  currentTourStep: number;
  isWelcomeModalOpen: boolean;
  isGuideHubOpen: boolean;
  selectedGuideTab: string;
  isResetConfirmOpen: boolean;
  isCompletionModalOpen: boolean;
  stepSnapshots: Record<number, any>;

  setHasCompletedOnboarding: (completed: boolean) => void;
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
  openGuideHub: (tabId?: string) => void;
  closeGuideHub: () => void;
  setSelectedGuideTab: (tabId: string) => void;
  openResetConfirm: () => void;
  closeResetConfirm: () => void;
  openCompletionModal: () => void;
  closeCompletionModal: () => void;

  startTour: (step?: number) => void;
  nextTourStep: () => void;
  skipTourStep: () => void;
  prevTourStep: () => void;
  endTour: (completed?: boolean) => void;
  handleStartTourRequest: () => void;
  confirmStartTourWithDefaultData: () => void;
  takeSnapshot: (step: number) => void;
  restoreSnapshot: (step: number) => void;
}

export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  actionHint: string;
  placement: "top" | "bottom" | "left" | "right" | "top-right" | "top-left";
  settingsTab?: "students" | "roles" | "groups" | "constraints" | "global";
  isInfoOnly?: boolean;

  setupPreState: (mainStore: StateAndActions) => void;
  setupPostState: (mainStore: StateAndActions) => void;
  setupIdealState: (mainStore: StateAndActions) => void;
  checkCondition: (
    mainStore: StateAndActions,
    onboardingStore: OnboardingState,
  ) => boolean;
}
