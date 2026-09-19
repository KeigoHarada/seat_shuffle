import type React from "react";
import type { StateAndActions } from "../stores/appStore";
import type { OnboardingState } from "../stores/onboarding";

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
