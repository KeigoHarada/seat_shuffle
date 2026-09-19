import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useStore } from "./appStore";
import { useUiStore } from "./uiStore";
import { TOUR_STEPS } from "../data/tourSteps";
import type { OnboardingState } from "../types/onboarding";

export type { OnboardingState };

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      isTourActive: false,
      currentTourStep: 0,
      isWelcomeModalOpen: false,
      isGuideHubOpen: false,
      selectedGuideTab: "tour",
      isResetConfirmOpen: false,
      isCompletionModalOpen: false,
      stepSnapshots: {},

      setHasCompletedOnboarding: (completed) =>
        set({ hasCompletedOnboarding: completed }),

      openWelcomeModal: () => set({ isWelcomeModalOpen: true }),
      closeWelcomeModal: () => set({ isWelcomeModalOpen: false }),

      openGuideHub: (tabId = "tour") =>
        set({ isGuideHubOpen: true, selectedGuideTab: tabId }),
      closeGuideHub: () => set({ isGuideHubOpen: false }),
      setSelectedGuideTab: (tabId) => set({ selectedGuideTab: tabId }),

      openResetConfirm: () => set({ isResetConfirmOpen: true }),
      closeResetConfirm: () => set({ isResetConfirmOpen: false }),

      openCompletionModal: () => set({ isCompletionModalOpen: true }),
      closeCompletionModal: () => set({ isCompletionModalOpen: false }),

      startTour: (step = 0) => {
        const targetStep = TOUR_STEPS[step];
        if (targetStep) {
          targetStep.setupPreState(useStore.getState());
        }
        set({
          isTourActive: true,
          currentTourStep: step,
          isWelcomeModalOpen: false,
          isGuideHubOpen: false,
          isResetConfirmOpen: false,
          stepSnapshots: {},
        });
        get().takeSnapshot(step);
      },

      nextTourStep: () => {
        const { currentTourStep, endTour, openCompletionModal } = get();
        const nextStepIndex = currentTourStep + 1;

        const currentStep = TOUR_STEPS[currentTourStep];
        currentStep.setupPostState(useStore.getState());

        if (nextStepIndex < TOUR_STEPS.length) {
          const nextStep = TOUR_STEPS[nextStepIndex];
          nextStep.setupPreState(useStore.getState());
          set({ currentTourStep: nextStepIndex });
          get().takeSnapshot(nextStepIndex);
        } else {
          endTour(true);
          openCompletionModal();
        }
      },

      skipTourStep: () => {
        const { currentTourStep, endTour, openCompletionModal } = get();
        const nextStepIndex = currentTourStep + 1;

        const currentStep = TOUR_STEPS[currentTourStep];
        currentStep.setupIdealState(useStore.getState());

        if (nextStepIndex < TOUR_STEPS.length) {
          const nextStep = TOUR_STEPS[nextStepIndex];
          nextStep.setupPreState(useStore.getState());
          set({ currentTourStep: nextStepIndex });
          get().takeSnapshot(nextStepIndex);
        } else {
          endTour(true);
          openCompletionModal();
        }
      },

      prevTourStep: () => {
        const { currentTourStep, restoreSnapshot } = get();
        if (currentTourStep > 0) {
          const prevStepIndex = currentTourStep - 1;
          restoreSnapshot(prevStepIndex);
          set({ currentTourStep: prevStepIndex });
        }
      },

      takeSnapshot: (step: number) => {
        const state = useStore.getState();
        const uiState = useUiStore.getState();
        const snapshot = {
          students: JSON.parse(JSON.stringify(state.students)),
          roles: JSON.parse(JSON.stringify(state.roles)),
          groups: JSON.parse(JSON.stringify(state.groups)),
          seats: JSON.parse(JSON.stringify(state.seats)),
          objects: JSON.parse(JSON.stringify(state.objects)),
          constraints: JSON.parse(JSON.stringify(state.constraints)),
          appSettings: JSON.parse(JSON.stringify(state.appSettings)),
          undoStack: JSON.parse(JSON.stringify(state.undoStack)),
          isViewMode: uiState.isViewMode,
          isSettingsOpen: uiState.isSettingsOpen,
          activeSettingsTab: uiState.activeSettingsTab,
        };
        set((s) => ({
          stepSnapshots: { ...s.stepSnapshots, [step]: snapshot },
        }));
      },

      restoreSnapshot: (step: number) => {
        const snapshot = get().stepSnapshots[step];
        if (snapshot) {
          useStore.getState().loadState({
            students: JSON.parse(JSON.stringify(snapshot.students)),
            roles: JSON.parse(JSON.stringify(snapshot.roles)),
            groups: JSON.parse(JSON.stringify(snapshot.groups)),
            seats: JSON.parse(JSON.stringify(snapshot.seats)),
            objects: JSON.parse(JSON.stringify(snapshot.objects)),
            constraints: JSON.parse(JSON.stringify(snapshot.constraints)),
            appSettings: JSON.parse(JSON.stringify(snapshot.appSettings)),
            undoStack: JSON.parse(JSON.stringify(snapshot.undoStack)),
          } as any);
          const ui = useUiStore.getState();
          ui.setIsViewMode(snapshot.isViewMode);
          ui.setIsSettingsOpen(snapshot.isSettingsOpen);
          ui.setActiveSettingsTab(snapshot.activeSettingsTab);
        } else {
          const prevStep = TOUR_STEPS[step];
          if (prevStep) {
            prevStep.setupPreState(useStore.getState());
          }
        }
      },

      endTour: (completed = false) => {
        set((state) => ({
          isTourActive: false,
          hasCompletedOnboarding: completed
            ? true
            : state.hasCompletedOnboarding,
        }));
      },

      handleStartTourRequest: () => {
        const mainState = useStore.getState();
        const hasStudents = mainState.students.length > 0;
        const hasSeats = mainState.seats.length > 0;

        if (hasStudents && hasSeats) {
          set({ isGuideHubOpen: false, isResetConfirmOpen: true });
        } else {
          get().startTour(0);
        }
      },

      confirmStartTourWithDefaultData: () => {
        set({ isResetConfirmOpen: false });
        get().startTour(0);
      },
    }),
    {
      name: "seat-shuffle-onboarding",
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);
