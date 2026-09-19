import { useState, useCallback, useRef, useEffect, type CSSProperties } from "react";
import { useOnboardingStore } from "../../../stores/onboarding";
import { useStore } from "../../../stores/appStore";
import { useUiStore } from "../../../stores/uiStore";
import { TOUR_STEPS } from "../../../data/tourSteps";
import type { TourStep } from "../../../types/onboarding";
import { useDraggablePosition } from "./useDraggablePosition";
import { useTourTargetRect, type TargetRect } from "./useTourTargetRect";

export type { TargetRect };

export function useTourOverlay() {
  const isTourActive = useOnboardingStore((state) => state.isTourActive);
  const currentTourStep = useOnboardingStore((state) => state.currentTourStep);
  const nextTourStep = useOnboardingStore((state) => state.nextTourStep);
  const skipTourStep = useOnboardingStore((state) => state.skipTourStep);
  const prevTourStep = useOnboardingStore((state) => state.prevTourStep);

  const activeSettingsTab = useUiStore((state) => state.activeSettingsTab);
  const seats = useStore((state) => state.seats);
  const students = useStore((state) => state.students);
  const groups = useStore((state) => state.groups);
  const constraints = useStore((state) => state.constraints);
  const isViewMode = useUiStore((state) => state.isViewMode);
  const isShuffling = useUiStore((state) => state.isShuffling);
  const undoStack = useStore((state) => state.undoStack);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hasActionFinished, setHasActionFinished] = useState(false);

  const currentStep: TourStep | undefined = TOUR_STEPS[currentTourStep];

  const { position, isDragging, handleMouseDown } =
    useDraggablePosition(currentTourStep);

  const targetRect = useTourTargetRect({
    isTourActive,
    currentStep,
    hasActionFinished,
    activeSettingsTab,
  });

  const checkStepCompletion = useCallback((): boolean => {
    if (!currentStep) return false;
    const mainStore = useStore.getState();
    const onboardingStore = useOnboardingStore.getState();
    return currentStep.checkCondition(mainStore, onboardingStore);
  }, [
    currentStep,
    seats,
    students,
    groups,
    constraints,
    undoStack.length,
    isShuffling,
    isViewMode,
  ]);

  useEffect(() => {
    if (!isTourActive || !currentStep) {
      setHasActionFinished(false);
      return;
    }

    const isDone = checkStepCompletion();
    if (isDone && !hasActionFinished) {
      setHasActionFinished(true);
    } else if (!isDone) {
      setHasActionFinished(false);
    }
  }, [isTourActive, currentStep, checkStepCompletion, hasActionFinished]);

  const getTooltipStyle = (): CSSProperties => {
    const defaultStyle: CSSProperties = {
      position: "fixed",
      zIndex: 1002,
    };

    let baseTop = 0;
    let baseLeft = 0;

    if (!targetRect || !currentStep) {
      return {
        ...defaultStyle,
        top: "50%",
        left: "50%",
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
      };
    }

    const margin = 16;
    const tooltipWidth = Math.min(360, window.innerWidth - 32);
    const tooltipHeight = Math.min(240, window.innerHeight * 0.55);

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let placement = currentStep.placement;
    if (currentStep.id === "step-shuffle" && !hasActionFinished) {
      placement = "top-right";
    }
    if (currentStep.id === "step-viewmode" && !hasActionFinished) {
      placement = "top-left";
    }

    switch (placement) {
      case "bottom":
        baseTop = targetRect.top + targetRect.height + margin;
        baseLeft = targetRect.left + (targetRect.width - tooltipWidth) / 2;
        break;
      case "top":
        baseTop = targetRect.top - tooltipHeight - margin;
        baseLeft = targetRect.left + (targetRect.width - tooltipWidth) / 2;
        break;
      case "right":
        baseTop = targetRect.top + (targetRect.height - tooltipHeight) / 2;
        baseLeft = targetRect.left + targetRect.width + margin;
        break;
      case "top-right":
        baseTop = targetRect.top - tooltipHeight - margin;
        baseLeft = targetRect.left + targetRect.width + margin;
        break;
      case "top-left":
        baseTop = targetRect.top - tooltipHeight - margin;
        baseLeft = targetRect.left - tooltipWidth - margin;
        break;
      case "left":
        baseTop = targetRect.top + (targetRect.height - tooltipHeight) / 2;
        baseLeft = targetRect.left - tooltipWidth - margin;
        break;
      default:
        baseTop = targetRect.top + targetRect.height + margin;
        baseLeft = targetRect.left;
    }

    if (baseLeft < 16) baseLeft = 16;
    if (baseLeft + tooltipWidth > windowWidth - 16) {
      baseLeft = windowWidth - tooltipWidth - 16;
    }
    if (baseTop < 16) baseTop = 16;
    if (baseTop + tooltipHeight > windowHeight - 16) {
      baseTop = windowHeight - tooltipHeight - 16;
    }

    return {
      ...defaultStyle,
      top: `${baseTop}px`,
      left: `${baseLeft}px`,
      transform: `translate(${position.x}px, ${position.y}px)`,
      transition: isDragging ? "none" : "top 0.25s ease, left 0.25s ease",
    };
  };

  const isLastStep = currentTourStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentTourStep === 0;

  return {
    isTourActive,
    currentStep,
    currentTourStep,
    isFirstStep,
    isLastStep,
    targetRect,
    hasActionFinished,
    tooltipRef,
    tooltipStyle: getTooltipStyle(),
    handleMouseDown,
    nextTourStep,
    prevTourStep,
    skipTourStep,
    totalSteps: TOUR_STEPS.length,
  };
}
